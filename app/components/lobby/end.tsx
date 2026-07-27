import type { Participation } from "~/api/types/participation";
import type { Submission } from "~/api/types/submission/submission";

interface EndProps {
  winningSubmission: Submission | null;
  participants: Participation[];
}

export function End({ winningSubmission, participants }: EndProps) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Lobby Ended</h2>
      {winningSubmission ? (
        <div className="bg-white/5 p-4 rounded flex flex-col gap-4 border border-yellow-500/30">
          <h3 className="text-lg font-bold text-yellow-500">Winner!</h3>
          <p>
            User{" "}
            {
              participants.find((p) => p.user.id === winningSubmission.userId)!
                .user.name
            }{" "}
            won with this submission:
          </p>
          <audio src={winningSubmission.value} controls className="w-full" />
        </div>
      ) : (
        <p className="text-gray-400">
          The lobby has ended, but no winner was determined.
        </p>
      )}
    </div>
  );
}
