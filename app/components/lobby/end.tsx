import { use } from "react";
import { LobbyContext } from "~/contexts";
import { AudioPlayer } from "../audio-player";

export function End() {
  const { lobby } = use(LobbyContext);
  const winningSubmission =
    lobby?.submissions.find((s) => s.id === lobby?.winningSubmissionId) ?? null;

  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-xl font-bold mb-4">Lobby Ended</h2>
      {winningSubmission ? (
        <div className="bg-black/5 dark:bg-white/5 p-4 rounded flex flex-col gap-4 border border-yellow-500/30">
          <h3 className="text-lg font-bold text-yellow-500">Winner!</h3>
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
