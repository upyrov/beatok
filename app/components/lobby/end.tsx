import { CgTrophy } from "react-icons/cg";
import { useLobbyStore } from "~/stores/lobby";
import { AudioPlayer } from "../lazy-audio-player";

export function End() {
	const lobby = useLobbyStore((s) => s.lobby);
	const winningSubmission =
		lobby?.submissions.find((s) => s.id === lobby?.winningSubmissionId) ?? null;

	return (
		<div className="flex flex-col items-center text-center">
			<h2 className="text-xl font-bold mb-4">Lobby Ended</h2>
			{winningSubmission ? (
				<div className="bg-muted p-4 rounded flex flex-col gap-4 border border-yellow-500/30">
					<h3 className="text-lg font-bold text-yellow-500 flex items-center justify-center gap-2">
						<CgTrophy /> Winner!
					</h3>
					<p>
						User{" "}
						{
							lobby?.participants.find(
								(p) => p.id === winningSubmission.participationId,
							)?.user.name
						}{" "}
						won with this submission:
					</p>
					<AudioPlayer src={winningSubmission.value} />
				</div>
			) : (
				<p className="text-gray-400">
					The lobby has ended, but no winner was determined.
				</p>
			)}
		</div>
	);
}
