import { useCallback, useEffect } from "react";
import { useStartLobby } from "~/api/lobby";
import { LobbyState } from "~/api/types/enums";
import type { SoundWithCategory } from "~/api/types/sound";
import { ActionButton } from "~/components/action-button";
import { MutationBoundary } from "~/components/mutation-boundary";
import { useLobbyStore } from "~/stores/lobby";
import { useUserStore } from "~/stores/user";

export function Waiting() {
  const lobby = useLobbyStore((s) => s.lobby);
  const setLobby = useLobbyStore((s) => s.setLobby);
  const connection = useLobbyStore((s) => s.connection);
  const user = useUserStore((s) => s.user);
  const startLobbyMutation = useStartLobby();

  const isOwner = user?.id === lobby?.ownerId;

  const handleStartLobby = useCallback(() => {
    if (lobby?.id) startLobbyMutation.mutate(lobby.id);
  }, [lobby?.id, startLobbyMutation]);

  useEffect(() => {
    if (!connection) return;

    function handleStarted(sounds: SoundWithCategory[]) {
      setLobby((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          state: LobbyState.Submitting,
          submissionStartedAt: new Date().toISOString(),
          sounds: prev.sounds?.length ? prev.sounds : sounds,
        };
      });
    }

    function handleParticipantConnected(userId: string) {
      setLobby((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: prev.participants.map((p) =>
            p.user.id === userId ? { ...p, isConnected: true } : p,
          ),
        };
      });
    }

    function handleOwnerChanged(ownerId: string) {
      setLobby((prev) => {
        if (!prev) return prev;
        return { ...prev, ownerId };
      });
    }

    function handleParticipantDisconnected(userId: string) {
      setLobby((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: prev.participants.map((p) =>
            p.user.id === userId ? { ...p, isConnected: false } : p,
          ),
        };
      });
    }

    connection.on("Started", handleStarted);
    connection.on("OwnerChanged", handleOwnerChanged);
    connection.on("ParticipantConnected", handleParticipantConnected);
    connection.on("ParticipantDisconnected", handleParticipantDisconnected);
    return () => {
      connection.off("Started", handleStarted);
      connection.off("OwnerChanged", handleOwnerChanged);
      connection.off("ParticipantConnected", handleParticipantConnected);
      connection.off("ParticipantDisconnected", handleParticipantDisconnected);
    };
  }, [connection, setLobby]);

  return (
    lobby && (
      <div className="flex flex-col items-center text-center">
        <h2 className="text-xl font-bold mb-4">Waiting</h2>
        {isOwner ? (
          lobby.participants.length > 1 ? (
            <MutationBoundary mutation={startLobbyMutation}>
              <ActionButton
                onClick={handleStartLobby}
                pending={startLobbyMutation.isPending}
              >
                Start Lobby
              </ActionButton>
            </MutationBoundary>
          ) : (
            <p className="text-gray-400">Waiting for users to join...</p>
          )
        ) : (
          <p className="text-gray-400">Waiting for host to start...</p>
        )}
      </div>
    )
  );
}
