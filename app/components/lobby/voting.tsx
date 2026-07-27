import { useState, useEffect, use } from "react";
import { RealtimeContext } from "~/contexts";
import { useForm } from "@tanstack/react-form";
import { type } from "arktype";
import type { Submission } from "~/api/types/submission/submission";
import { useVote } from "~/api/lobbies";
import { handleDownload } from "~/lib/download";
import { MutationBoundary } from "~/components/error/mutation-boundary";
import { LoadingButton } from "~/components/loading";
import type { HubConnection } from "@microsoft/signalr";
import type { LobbyWithParticipants } from "~/api/types/lobby/lobby-with-participants";
import { LobbyPhase } from "~/api/types/enums/lobby-phase";

function VoteForm({
  submissionId,
  lobbyId,
  isOwnTrack,
  onVote,
}: {
  submissionId: string;
  lobbyId: string;
  isOwnTrack?: boolean;
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

  if (voteMutation.isSuccess || voteMutation.isPending) {
    return (
      <div className="text-green-400 font-medium text-sm py-1">
        Vote registered!
      </div>
    );
  }

  if (isOwnTrack) {
    return <span className="text-gray-400 text-sm">Cannot vote on your own track</span>;
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
          <input
            type="number"
            min="1"
            max="10"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(Number(e.target.value))}
            className="w-16 bg-white/10 border border-white/20 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 text-white"
          />
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

interface VotingProps {
  lobbyId: string;
  submissions: Submission[];
  currentUserId?: string;
  setLobby: React.Dispatch<React.SetStateAction<LobbyWithParticipants | null>>;
  setWinningSubmission: React.Dispatch<React.SetStateAction<Submission | null>>;
}

export function Voting({ lobbyId, submissions, currentUserId, setLobby, setWinningSubmission }: VotingProps) {
  const { connection } = use(RealtimeContext);
  const [votedSubmissionId, setVotedSubmissionId] = useState<string | null>(null);

  useEffect(() => {
    if (!connection) return;

    function handleEnded(submission: Submission | null) {
      setLobby((prev) => {
        if (!prev) return prev;
        return { ...prev, phase: LobbyPhase.End };
      });
      setWinningSubmission(submission);
    }

    connection.on("Ended", handleEnded);
    return () => {
      connection.off("Ended", handleEnded);
    };
  }, [connection, setLobby, setWinningSubmission]);

  const displayedSubmissions = votedSubmissionId
    ? submissions.filter((sub) => sub.id === votedSubmissionId)
    : submissions;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Voting Phase</h2>
      <ul className="space-y-4">
        {displayedSubmissions.map((sub) => (
          <li
            key={sub.id}
            className="bg-white/5 p-4 rounded flex flex-col gap-4"
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold text-lg">
                Submission by User {sub.userId}
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleDownload(sub.value, `submission-${sub.id}.wav`);
                }}
                className="text-xs bg-blue-600/50 hover:bg-blue-600 px-3 py-1.5 rounded transition-colors whitespace-nowrap"
              >
                Download
              </button>
            </div>
            <audio src={sub.value} controls className="w-full" />
            <div className="border-t border-white/10 pt-4 mt-2">
              <p className="text-sm text-gray-400 mb-2">
                Rate this submission:
              </p>
              <VoteForm 
                submissionId={sub.id} 
                lobbyId={lobbyId} 
                isOwnTrack={sub.userId === currentUserId}
                onVote={() => setVotedSubmissionId(sub.id)}
              />
            </div>
          </li>
        ))}
      </ul>
      {!submissions.length && (
        <p className="text-gray-400">No submissions to vote on.</p>
      )}
    </div>
  );
}
