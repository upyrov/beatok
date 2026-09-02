import { Form as BaseForm } from "@base-ui/react";
import { useForm } from "@tanstack/react-form";
import { type } from "arktype";
import { useRef } from "react";
import { useUpdateScore, useVote } from "~/api/lobby";
import type { Score } from "~/api/types/score";
import { Knob } from "~/components/knob";
import { toastError } from "~/lib/toast";
import { useLobbyStore } from "~/stores/lobby";
import { useUserStore } from "~/stores/user";

export function ScoreForm({
	submissionId,
	lobbyId,
	isOwnTrack,
	existingScoreId,
	existingScoreValue,
	onVote,
}: {
	submissionId: string;
	lobbyId: string;
	isOwnTrack?: boolean;
	existingScoreId?: string;
	existingScoreValue?: number;
	onVote: () => void;
}) {
	const lobby = useLobbyStore((s) => s.lobby);
	const setLobby = useLobbyStore((s) => s.setLobby);
	const user = useUserStore((s) => s.user);

	const voteMutation = useVote();
	const updateScoreMutation = useUpdateScore();

	const creatingPromiseRef = useRef<Promise<string> | null>(null);

	const form = useForm({
		defaultValues: { score: existingScoreValue ?? 0 },
		onSubmit: async ({ value }) => {
			onVote();
			const realScore = lobby?.participants
				.find((p) => p.user.id === user?.id)
				?.scores?.find(
					(s) => s.submissionId === submissionId && !s.id.startsWith("temp-"),
				);

			let scoreIdToUpdate = realScore?.id;

			if (!scoreIdToUpdate && creatingPromiseRef.current) {
				try {
					scoreIdToUpdate = await creatingPromiseRef.current;
				} catch (e) {
					// If creation failed, we let it fall through to create again.
				}
			}

			const updateParticipantScores = (
				updater: (scores: Score[]) => Score[],
			) => {
				setLobby((prev) => {
					if (!prev) return prev;
					return {
						...prev,
						participants: prev.participants.map((p) => {
							if (p.user.id !== user?.id) return p;
							return { ...p, scores: updater(p.scores ?? []) };
						}),
					};
				});
			};

			if (scoreIdToUpdate) {
				try {
					await updateScoreMutation.mutateAsync({
						id: lobbyId,
						scoreId: scoreIdToUpdate,
						data: { value: value.score },
					});
				} catch (err) {
					toastError(err);
					// Revert optimistic update
					updateParticipantScores((scores) =>
						scores.map((s) =>
							s.id === scoreIdToUpdate
								? { ...s, value: String(existingScoreValue ?? 0) }
								: s,
						),
					);
				}
			} else {
				let promise: Promise<string> | null = null;
				try {
					promise = voteMutation.mutateAsync({
						id: lobbyId,
						data: { value: value.score, submissionId },
					});
					creatingPromiseRef.current = promise;
					const newScoreId = await promise;

					// Update optimistic score ID to real score ID
					updateParticipantScores((scores) =>
						scores.map((s) =>
							s.submissionId === submissionId && s.id.startsWith("temp-")
								? { ...s, id: newScoreId }
								: s,
						),
					);
				} catch (err) {
					toastError(err);
					// Revert optimistic update
					updateParticipantScores((scores) =>
						scores.filter(
							(s) =>
								s.submissionId !== submissionId || !s.id.startsWith("temp-"),
						),
					);
				} finally {
					if (promise && creatingPromiseRef.current === promise) {
						creatingPromiseRef.current = null;
					}
				}
			}
		},
	});

	if (isOwnTrack) {
		return null;
	}

	return (
		<div className="flex flex-col gap-2">
			<BaseForm
				onSubmit={(e: React.SyntheticEvent) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="flex items-center gap-2"
			>
				<form.Field
					name="score"
					validators={{ onChange: type("1 <= number <= 10") }}
					children={(field) => (
						<div className="flex items-center gap-3">
							<Knob
								value={field.state.value}
								onChange={(val) => {
									field.handleChange(val);
								}}
								onChangeEnd={(val) => {
									// Optimistic UI update only when drag finishes
									setLobby((prev) => {
										if (!prev) return prev;
										return {
											...prev,
											participants: prev.participants.map((p) => {
												if (p.user.id !== user?.id) return p;

												const existing = p.scores?.find(
													(s) => s.submissionId === submissionId,
												);
												if (existing) {
													return {
														...p,
														scores: p.scores?.map((s) =>
															s.id === existing.id
																? { ...s, value: String(val) }
																: s,
														),
													};
												} else {
													const newScore = {
														id: "temp-" + Date.now(),
														value: String(val),
														submissionId,
														participationId: p.id,
													};
													return {
														...p,
														scores: [...(p.scores ?? []), newScore],
													};
												}
											}),
										};
									});
									form.handleSubmit();
								}}
								min={0}
								max={10}
								size={60}
								color={
									field.state.value >= 8
										? "#4ade80"
										: field.state.value >= 4
											? "#fb923c"
											: "#f87171"
								}
							/>
							<span className="font-mono font-bold text-xl w-6 text-center">
								{field.state.value}
							</span>
						</div>
					)}
				/>
			</BaseForm>
		</div>
	);
}
