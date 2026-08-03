import { useForm } from "@tanstack/react-form";
import { type } from "arktype";
import { use } from "react";
import { useOutletContext } from "react-router";
import { useUpdateScore, useVote } from "~/api/lobby";
import type { Me } from "~/api/types/user/me";
import { ActionButton } from "~/components/action-button";
import { MutationBoundary } from "~/components/mutation-boundary";
import { LobbyContext } from "~/contexts";

export function VoteForm({
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
  const voteMutation = useVote();
  const updateScoreMutation = useUpdateScore();
  const { setLobby } = use(LobbyContext);
  const { user } = useOutletContext<{ user: Me | null }>();

  const form = useForm({
    defaultValues: { score: existingScoreValue ?? 5 },
    onSubmit: async ({ value }) => {
      onVote();
      if (existingScoreId) {
        await updateScoreMutation.mutateAsync({
          id: lobbyId,
          scoreId: existingScoreId,
          data: { value: value.score },
        });
        setLobby((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            participants: prev.participants.map((p) => {
              if (p.user.id !== user?.id) return p;
              return {
                ...p,
                scores: p.scores?.map((s) =>
                  s.id === existingScoreId
                    ? { ...s, value: String(value.score) }
                    : s,
                ),
              };
            }),
          };
        });
      } else {
        const scoreId = await voteMutation.mutateAsync({
          id: lobbyId,
          data: { value: value.score, submissionId },
        });
        setLobby((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            participants: prev.participants.map((p) => {
              if (p.user.id !== user?.id) return p;
              const newScore = {
                id: scoreId,
                value: String(value.score),
                submissionId,
                participationId: p.id,
              };
              return {
                ...p,
                scores: [...(p.scores || []), newScore],
              };
            }),
          };
        });
      }
    },
  });

  if (isOwnTrack) {
    return (
      <span className="text-gray-400 text-sm">
        Cannot vote on your own track
      </span>
    );
  }

  const isPending = voteMutation.isPending || updateScoreMutation.isPending;
  const isSuccess = voteMutation.isSuccess || updateScoreMutation.isSuccess;

  return (
    <div className="flex flex-col gap-2">
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
          <MutationBoundary mutation={updateScoreMutation}>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <ActionButton
                  disabled={!canSubmit}
                  isPending={isSubmitting || isPending}
                >
                  {existingScoreId ? "Update" : "Vote"}
                </ActionButton>
              )}
            />
          </MutationBoundary>
        </MutationBoundary>
      </form>
      {isSuccess && (
        <div className="text-green-400 font-medium text-xs">
          Vote registered!
        </div>
      )}
    </div>
  );
}
