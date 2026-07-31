import { useStartLobby } from "~/api/lobbies";
import { MutationBoundary } from "~/components/error/mutation-boundary";
import { LoadingButton } from "~/components/loading";
import { useEffect, use } from "react";
import { LobbyState } from "~/api/types/enums/lobby-state";
import { LobbyContext, RealtimeContext } from "~/contexts";
import { useOutletContext } from "react-router";
import type { Me } from "~/api/types/user/me";
import type { SoundWithCategory } from "~/api/types/sound/sound-with-category";
import type { Participation } from "~/api/types/participation";

export function Waiting() {
  const { lobby, setLobby } = use(LobbyContext);
  const { user } = useOutletContext<{ user: Me | null }>();

  if (!lobby) return;

  const isOwner = user?.id === lobby.ownerId;
  const startLobbyMutation = useStartLobby();
  const { connection } = use(RealtimeContext);

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

    function handleParticipantJoined(p: Participation) {
      setLobby((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: [...prev.participants, p],
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
    connection.on("ParticipantJoined", handleParticipantJoined);
    connection.on("OwnerChanged", handleOwnerChanged);
    connection.on("ParticipantDisconnected", handleParticipantDisconnected);

    return () => {
      connection.off("Started", handleStarted);
      connection.off("ParticipantJoined", handleParticipantJoined);
      connection.off("OwnerChanged", handleOwnerChanged);
      connection.off("ParticipantDisconnected", handleParticipantDisconnected);
    };
  }, [connection, setLobby]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Not Started</h2>
      {isOwner ? (
        lobby.participants.length > 1 ? (
          <MutationBoundary mutation={startLobbyMutation}>
            <LoadingButton
              onClick={() => startLobbyMutation.mutate(lobby.id)}
              isPending={startLobbyMutation.isPending}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-semibold"
            >
              Start Lobby
            </LoadingButton>
          </MutationBoundary>
        ) : (
          <p className="text-gray-400">Waiting for users to join...</p>
        )
      ) : (
        <p className="text-gray-400">Waiting for host to start...</p>
      )}
    </div>
  );
}
