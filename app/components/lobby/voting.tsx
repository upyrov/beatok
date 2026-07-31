import { useState, use } from "react";
import { useCountdown } from "~/hooks/use-countdown";
import { useForm } from "@tanstack/react-form";
import { type } from "arktype";
import { useVote } from "~/api/lobbies";
import { MutationBoundary } from "~/components/error/mutation-boundary";
import { LoadingButton } from "~/components/loading";
import { AudioPlayer } from "~/components/audio-player";
import { useOutletContext } from "react-router";
import { LobbyContext } from "~/contexts";
import type { Me } from "~/api/types/user/me";

function VoteForm({
  submissionId,
  lobbyId,
  isOwnTrack,
  isVoted,
  onVote,
}: {
  submissionId: string;
  lobbyId: string;
  isOwnTrack?: boolean;
  isVoted?: boolean;
  onVote: () => void;
}) {
  const voteMutation = useVote();

  const form = useForm({
    defaultValues: { score: 5 },
    onSubmit: async ({ value }) => {
      onVote();
      await voteMutation.mutateAsync({
        id: lobbyId,
        data: { value: value.score, submissionId },
      });
    },
  });

  if (isVoted || voteMutation.isSuccess || voteMutation.isPending) {
    return (
      <div className="text-green-400 font-medium text-sm py-1">
        Vote registered!
      </div>
    );
  }

  if (isOwnTrack) {
    return (
      <span className="text-gray-400 text-sm">
        Cannot vote on your own track
      </span>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="flex items-center gap-2"
    >
      <form.Field
        name="score"
        validators={{
          onChange: type("1 <= number <= 10"),
        }}
        children={(field) => (
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              className="w-32 accent-blue-500"
            />
            <span className="font-mono font-medium w-4 text-center">
              {field.state.value}
            </span>
          </div>
        )}
      />
      <MutationBoundary mutation={voteMutation}>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <LoadingButton
              type="submit"
              disabled={!canSubmit}
              isPending={isSubmitting || voteMutation.isPending}
              className="bg-blue-600 hover:bg-blue-500 px-3 py-1 text-sm rounded transition-colors font-medium text-white"
            >
              Vote
            </LoadingButton>
          )}
        />
      </MutationBoundary>
    </form>
  );
}

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

  const safeSubmissions = Array.isArray(lobby?.submissions)
    ? lobby.submissions
    : [];
  const displayedSubmissions = votedSubmissionId
    ? safeSubmissions.filter((s) => s.id === votedSubmissionId)
    : safeSubmissions.filter((s) => s.participationId !== participation?.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Voting state</h2>
        <div className="text-2xl font-mono font-bold text-yellow-400 tracking-wider">
          {minutes}:{seconds}
        </div>
      </div>
      <ul className="space-y-4">
        {displayedSubmissions.map((s) => (
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
              <VoteForm
                submissionId={s.id}
                lobbyId={lobby?.id ?? ""}
                isOwnTrack={s.participationId === participation?.id}
                isVoted={participation?.scores?.some(
                  (score) => score.submissionId === s.id,
                )}
                onVote={() => setVotedSubmissionId(s.id)}
              />
            </div>
          </li>
        ))}
      </ul>
      {!safeSubmissions.length && (
        <p className="text-gray-400">No submissions to vote on.</p>
      )}
    </div>
  );
}
