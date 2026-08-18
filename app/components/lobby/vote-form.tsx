import { Form as BaseForm } from "@base-ui/react";
import { useForm } from "@tanstack/react-form";
import { type } from "arktype";
import { use } from "react";
import { useOutletContext } from "react-router";
import { useUpdateScore, useVote } from "~/api/lobby";
import type { Me } from "~/api/types/user";
import { Knob } from "~/components/knob";
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
  const { lobby, setLobby } = use(LobbyContext);
  const { user } = useOutletContext<{ user: Me | null }>();

  const voteMutation = useVote();
  const updateScoreMutation = useUpdateScore();

  const form = useForm({
    defaultValues: { score: existingScoreValue ?? 0 },
    onSubmit: async ({ value }) => {
      onVote();
      const realScore = lobby?.participants
        .find((p) => p.user.id === user?.id)
        ?.scores?.find(
          (s) => s.submissionId === submissionId && !s.id.startsWith("temp-"),
        );

      if (realScore) {
        try {
          await updateScoreMutation.mutateAsync({
            id: lobbyId,
            scoreId: realScore.id,
            data: { value: value.score },
          });
        } catch (err) {
          console.error(err);
          window.dispatchEvent(
            new CustomEvent("globalerror", {
              detail:
                err instanceof Error ? err.message : "Failed to update vote",
            }),
          );
          // Revert optimistic update
          setLobby((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              participants: prev.participants.map((p) => {
                if (p.user.id !== user?.id) return p;
                return {
                  ...p,
                  scores: p.scores?.map((s) =>
                    s.id === realScore.id
                      ? { ...s, value: String(existingScoreValue ?? 0) }
                      : s,
                  ),
                };
              }),
            };
          });
        }
      } else {
        try {
          await voteMutation.mutateAsync({
            id: lobbyId,
            data: { value: value.score, submissionId },
          });
        } catch (err) {
          console.error(err);
          window.dispatchEvent(
            new CustomEvent("globalerror", {
              detail: err instanceof Error ? err.message : "Failed to vote",
            }),
          );
          // Revert optimistic update
          setLobby((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              participants: prev.participants.map((p) => {
                if (p.user.id !== user?.id) return p;
                return {
                  ...p,
                  scores: p.scores?.filter(
                    (s) =>
                      s.submissionId !== submissionId ||
                      !s.id.startsWith("temp-"),
                  ),
                };
              }),
            };
          });
        }
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

  return (
    <div className="flex flex-col gap-2">
      <BaseForm
        onSubmit={(e: React.SyntheticEvent) => {
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
              <Knob
                value={field.state.value}
                onChange={(val) => {
                  field.handleChange(val);
                  // Optimistic UI update instantly while dragging
                  setLobby((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      participants: prev.participants.map((p) => {
                        if (p.user.id !== user?.id) return p;

                        const existing = p.scores?.find(
                          (s) => s.submissionId === submissionId,
                        );
                        if (existing) {
                          return {
                            ...p,
                            scores: p.scores?.map((s) =>
                              s.id === existing.id
                                ? { ...s, value: String(val) }
                                : s,
                            ),
                          };
                        } else {
                          const newScore = {
                            id: "temp-" + Date.now(),
                            value: String(val),
                            submissionId,
                            participationId: p.id,
                          };
                          return {
                            ...p,
                            scores: [...(p.scores ?? []), newScore],
                          };
                        }
                      }),
                    };
                  });
                }}
                onChangeEnd={() => form.handleSubmit()}
                min={0}
                max={10}
                size={60}
                color={
                  field.state.value >= 8
                    ? "#4ade80"
                    : field.state.value >= 4
                      ? "#fb923c"
                      : "#f87171"
                }
              />
              <span className="font-mono font-bold text-xl w-6 text-center">
                {field.state.value}
              </span>
            </div>
          )}
        />
      </BaseForm>
    </div>
  );
}
