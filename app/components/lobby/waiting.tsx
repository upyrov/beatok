import { use, useCallback, useEffect } from "react";
import { useOutletContext } from "react-router";
import { useStartLobby } from "~/api/lobby";
import { LobbyState } from "~/api/types/enums/lobby-state";
import type { SoundWithCategory } from "~/api/types/sound/sound-with-category";
import type { Me } from "~/api/types/user/me";
import { Button } from "~/components/button";
import { MutationBoundary } from "~/components/mutation-boundary";
import { LobbyContext } from "~/contexts";

export function Waiting() {
  const { lobby, setLobby, connection } = use(LobbyContext);
  const { user } = useOutletContext<{ user: Me | null }>();
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
      <div>
        <h2 className="text-xl font-bold mb-4">Not Started</h2>
        {isOwner ? (
          lobby.participants.length > 1 ? (
            <MutationBoundary mutation={startLobbyMutation}>
              <Button
                onClick={handleStartLobby}
                isPending={startLobbyMutation.isPending}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-semibold"
              >
                Start Lobby
              </Button>
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
