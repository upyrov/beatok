import { useForm } from "@tanstack/react-form";
import { type } from "arktype";
import { useVote, useUpdateScore } from "~/api/lobby";
import { Button } from "~/components/button";
import { MutationBoundary } from "~/components/mutation-boundary";

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
      } else {
        await voteMutation.mutateAsync({
          id: lobbyId,
          data: { value: value.score, submissionId },
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
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  isPending={isSubmitting || isPending}
                  className="bg-blue-600 hover:bg-blue-500 px-3 py-1 text-sm rounded transition-colors font-medium text-white"
                >
                  {existingScoreId ? "Update" : "Vote"}
                </Button>
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
