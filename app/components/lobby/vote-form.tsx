import { useForm } from "@tanstack/react-form";
import { type } from "arktype";
import { useVote } from "~/api/lobby";
import { Button } from "~/components/button";
import { MutationBoundary } from "~/components/mutation-boundary";

export function VoteForm({
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
            <Button
              type="submit"
              disabled={!canSubmit}
              isPending={isSubmitting || voteMutation.isPending}
              className="bg-blue-600 hover:bg-blue-500 px-3 py-1 text-sm rounded transition-colors font-medium text-white"
            >
              Vote
            </Button>
          )}
        />
      </MutationBoundary>
    </form>
  );
}
