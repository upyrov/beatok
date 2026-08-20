import { use, useCallback, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { useKickParticipant } from "~/api/lobby";
import { LobbyState } from "~/api/types/enums";
import type { Participation } from "~/api/types/participation";
import type { Me, RatingChange } from "~/api/types/user";
import { ActionButton } from "~/components/action-button";
import { MutationBoundary } from "~/components/mutation-boundary";
import { UserCard } from "~/components/user-card";
import { LobbyContext } from "~/contexts";

export function ParticipantList({
  ratingChanges = [],
}: {
  ratingChanges?: RatingChange[];
}) {
  const { lobby, setLobby, connection } = use(LobbyContext);
  const { user } = useOutletContext<{ user: Me | null }>();
  const kickParticipantMutation = useKickParticipant();
  const navigate = useNavigate();

  useEffect(() => {
    if (!connection) return;

    function handleParticipantJoined(p: Participation) {
      setLobby((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: [...prev.participants, p],
        };
      });
    }

    function handleParticipantLeft(userId: string) {
      if (user?.id && userId === user.id) {
        navigate("/");
        return;
      }

      setLobby((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: prev.participants.filter((p) => p.user.id !== userId),
        };
      });
    }

    connection.on("ParticipantJoined", handleParticipantJoined);
    connection.on("ParticipantLeft", handleParticipantLeft);

    return () => {
      connection.off("ParticipantJoined", handleParticipantJoined);
      connection.off("ParticipantLeft", handleParticipantLeft);
    };
  }, [connection, setLobby, user?.id, navigate]);

  const handleKick = useCallback(
    (targetUserId: string) => {
      if (!lobby?.id) return;
      kickParticipantMutation.mutate({
        id: lobby.id,
        targetUserId,
      });
    },
    [kickParticipantMutation, lobby?.id],
  );

  return (
    <div className="bg-muted border border-muted-border rounded-xl p-4">
      <h2 className="text-xl font-bold mb-4">Participants</h2>
      <ul className="flex flex-col gap-2">
        {lobby?.participants.map((p, index) => (
          <li key={p.id} className="flex items-center gap-4 justify-between">
            <UserCard
              user={p.user}
              className="is-lg flex-1"
              badges={
                <>
                  {!p.isConnected && (
                    <span className="bg-black/10 dark:bg-white/10 text-gray-500 dark:text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                      Disconnected
                    </span>
                  )}
                  {p.user.id === lobby?.ownerId && (
                    <span className="bg-black/10 dark:bg-white/10 text-gray-500 dark:text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                      Owner
                    </span>
                  )}
                  {p.user.id === user?.id &&
                    user?.isAnonymous &&
                    p.user.id !== lobby?.ownerId && (
                      <span className="bg-black/10 dark:bg-white/10 text-gray-500 dark:text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                        You
                      </span>
                    )}
                </>
              }
            />

            <div className="flex items-center gap-2 ml-auto">
              {(() => {
                const rc =
                  ratingChanges.find((r) => r.userId === p.user.id) ||
                  ratingChanges[index];
                if (!rc.ratingChange) return null;

                const change = Math.round(rc.ratingChange);
                const isGain = change >= 0;
                return (
                  <span
                    style={{
                      animationFillMode: "both",
                      animationDelay: `${index * 150}ms`,
                    }}
                    className={
                      isGain
                        ? "text-green-500 font-bold bg-green-500/10 px-2 py-1 rounded-md animate-in zoom-in-75 fade-in slide-in-from-bottom-2 duration-500"
                        : "text-red-500 font-bold bg-red-500/10 px-2 py-1 rounded-md animate-in zoom-in-75 fade-in slide-in-from-bottom-2 duration-500"
                    }
                  >
                    {isGain ? "+" : ""}
                    {change}
                  </span>
                );
              })()}

              {user?.id === lobby?.ownerId &&
                p.user.id !== user?.id &&
                lobby.state === LobbyState.Waiting && (
                  <MutationBoundary mutation={kickParticipantMutation}>
                    <ActionButton
                      onClick={() => handleKick(p.user.id)}
                      pending={kickParticipantMutation.isPending}
                    >
                      Kick
                    </ActionButton>
                  </MutationBoundary>
                )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
