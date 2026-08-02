import { use, useCallback, useMemo, useState } from "react";
import { useOutletContext } from "react-router";
import type { Me } from "~/api/types/user/me";
import { AudioPlayer } from "~/components/audio-player";
import { LobbyContext } from "~/contexts";
import { useCountdown } from "~/hooks/use-countdown";
import { VoteForm } from "./vote-form";

export function Voting() {
  const { lobby } = use(LobbyContext);
  const { user } = useOutletContext<{ user: Me | null }>();
  const { minutes, seconds } = useCountdown(
    lobby?.votingTime ?? "00:00:00",
    lobby?.votingStartedAt,
  );

  const [votedSubmissionId, setVotedSubmissionId] = useState<string | null>(
    null,
  );

  const participation = lobby?.participants.find((p) => p.user.id === user?.id);
  const submissions = useMemo(
    () =>
      votedSubmissionId
        ? lobby?.submissions?.filter((s) => s.id === votedSubmissionId)
        : lobby?.submissions?.filter(
            (s) => s.participationId !== participation?.id,
          ),
    [votedSubmissionId, lobby?.submissions, participation?.id],
  );

  const handleVote = useCallback(
    (submissionId: string) => setVotedSubmissionId(submissionId),
    [],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Voting state</h2>
        <div className="text-2xl font-mono font-bold text-yellow-400 tracking-wider">
          {minutes}:{seconds}
        </div>
      </div>
      <ul className="space-y-4">
        {submissions?.map((s) => (
          <li key={s.id} className="bg-white/5 p-4 rounded flex flex-col gap-4">
            <div className="font-semibold text-lg">
              Submission by{" "}
              {
                lobby?.participants.find((p) => p.id === s.participationId)
                  ?.user.name
              }
            </div>
            <AudioPlayer src={s.value} className="w-full" />
            <div className="border-t border-white/10 pt-4 mt-2">
              <p className="text-sm text-gray-400 mb-2">
                Rate this submission:
              </p>
              {(() => {
                const existingScore = participation?.scores?.find(
                  (score) => score.submissionId === s.id,
                );
                return (
                  <VoteForm
                    submissionId={s.id}
                    lobbyId={lobby?.id ?? ""}
                    isOwnTrack={s.participationId === participation?.id}
                    existingScoreId={existingScore?.id}
                    existingScoreValue={Number(existingScore?.value)}
                    onVote={() => handleVote(s.id)}
                  />
                );
              })()}
            </div>
          </li>
        ))}
      </ul>
      {!lobby?.submissions?.length && (
        <p className="text-gray-400">No submissions to vote on.</p>
      )}
    </div>
  );
}
