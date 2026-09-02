import { Form as BaseForm, Input as BaseInput } from "@base-ui/react";
import { useForm } from "@tanstack/react-form";
import { useUserStore } from "~/stores/user";

import { type } from "arktype";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Me, User } from "~/api/types/user";

import { UserCard } from "~/components/user-card";
import { toastError } from "~/lib/toast";
import { useLobbyStore } from "~/stores/lobby";
import { ActionButton } from "../action-button";

export interface Message {
	id?: string;
	content: string;
	sender: User | Me;
}

function ReactionButton({
	emoji,
	onReact,
}: {
	emoji: string;
	onReact: (e: string) => void;
}) {
	const [particles, setParticles] = useState<{ id: number; x: number }[]>([]);

	const handleClick = useCallback(() => {
		onReact(emoji);
		const newId = Date.now() + Math.random();
		const x = (Math.random() - 0.5) * 24;
		setParticles((prev) => [...prev, { id: newId, x }]);
		setTimeout(() => {
			setParticles((prev) => prev.filter((p) => p.id !== newId));
		}, 600);
	}, [emoji, onReact]);

	return (
		<button
			onClick={handleClick}
			className={`relative active:scale-90 hover:bg-black/10 dark:hover:bg-white/10 rounded px-2 py-1 transition-all text-lg shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white ${
				particles.length > 0 ? "z-10" : ""
			}`}
			type="button"
		>
			<span className="relative z-10">{emoji}</span>
			{particles.map((p) => (
				<span
					key={p.id}
					className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-float-up text-base z-20"
					style={{ "--x": `${p.x}px` } as React.CSSProperties}
				>
					{emoji}
				</span>
			))}
		</button>
	);
}

export function Chat() {
	const lobby = useLobbyStore((s) => s.lobby);
	const connection = useLobbyStore((s) => s.connection);
	const user = useUserStore((s) => s.user);
	const [messages, setMessages] = useState<Message[]>([]);
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const formRef = useRef<HTMLFormElement>(null);

	const setRefs = useCallback((el: HTMLDivElement | null) => {
		scrollRef.current = el;
	}, []);

	const participantsRef = useRef(lobby?.participants ?? []);
	useEffect(() => {
		participantsRef.current = lobby?.participants ?? [];
	}, [lobby?.participants]);

	useEffect(() => {
		if (!connection) return;

		function handleMessageReceived(userId: string, content: string) {
			setMessages((prev) => {
				const sender = participantsRef.current.find(
					(p) => p.user.id === userId,
				)?.user;
				if (!sender) return prev;

				// Basic deduplication if it echoes back
				if (sender.id === user?.id) {
					const isDuplicate = prev.some(
						(m) => m.sender.id === user?.id && m.content === content,
					);
					if (isDuplicate) return prev;
				}
				return [...prev, { id: crypto.randomUUID(), content, sender }];
			});
		}

		connection.on("MessageReceived", handleMessageReceived);
		return () => {
			connection.off("MessageReceived", handleMessageReceived);
		};
	}, [connection]);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages]);

	const form = useForm({
		defaultValues: {
			content: "",
		},
		onSubmit: async ({ value }) => {
			if (!connection || !lobby?.id) return;
			const content = value.content;
			form.reset();

			const tempId = crypto.randomUUID();

			// Optimistic update
			if (user) {
				setMessages((prev) => [...prev, { id: tempId, content, sender: user }]);
			}

			try {
				await connection.invoke("SendMessage", lobby.id, content);
			} catch (error) {
				toastError(error);
				// Revert message on failure
				if (user) {
					setMessages((prev) => prev.filter((m) => m.id !== tempId));
				}
				form.setFieldValue("content", content);
			}
		},
	});

	const handleQuickReaction = useCallback(
		async (emoji: string) => {
			if (!connection || !lobby?.id) return;
			const tempId = crypto.randomUUID();
			if (user) {
				setMessages((prev) => [
					...prev,
					{ id: tempId, content: emoji, sender: user },
				]);
			}
			try {
				await connection.invoke("SendMessage", lobby.id, emoji);
			} catch (error) {
				toastError(error);
				if (user) {
					setMessages((prev) => prev.filter((m) => m.id !== tempId));
				}
			}
		},
		[setMessages],
	);

	return (
		<div className="flex flex-col border border-muted-border rounded-xl bg-muted overflow-hidden h-150 shrink-0">
			<div className="p-4 border-b border-muted-border font-bold">Chat</div>
			<div
				ref={setRefs}
				className="flex-1 overflow-y-scroll overflow-x-hidden p-4 flex flex-col gap-2"
			>
				{messages.map((m, i) => (
					<div
						key={m.id || `msg-${i}`}
						className="text-sm flex items-start gap-2 starting:opacity-0 starting:translate-y-2 transition-all duration-300"
					>
						<UserCard user={m.sender} className="shrink-0" />
						<span className="wrap-break-word mt-1">{m.content}</span>
					</div>
				))}
			</div>
			<div className="border-t border-muted-border flex flex-col relative z-20">
				<div className="px-4 pt-3 flex flex-wrap gap-1 relative z-10">
					{["🔥", "😂", "🤯", "👍", "❤️", "💀", "🥶"].map((emoji) => (
						<ReactionButton
							key={emoji}
							emoji={emoji}
							onReact={handleQuickReaction}
						/>
					))}
				</div>
				<BaseForm
					ref={formRef}
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="p-4 flex gap-2"
				>
					<form.Field
						name="content"
						validators={{ onChange: type("string > 0") }}
						children={(field) => (
							<BaseInput
								name={field.name}
								type="text"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									field.handleChange(e.target.value)
								}
								placeholder="Say something..."
								className="flex-1 bg-black/10 dark:bg-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
							/>
						)}
					/>
					<form.Subscribe
						selector={(state) => [state.canSubmit, state.isSubmitting]}
						children={([canSubmit, isSubmitting]) => (
							<ActionButton type="submit" disabled={!canSubmit || isSubmitting}>
								Send
							</ActionButton>
						)}
					/>
				</BaseForm>
			</div>
		</div>
	);
}
