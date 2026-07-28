import { useStartLobby } from "~/api/lobbies";
import type { Participation } from "~/api/types/participation";
import { MutationBoundary } from "~/components/error/mutation-boundary";
import { LoadingButton } from "~/components/loading";
import { useEffect, use } from "react";
import { RealtimeContext } from "~/contexts";
import type { SoundWithCategory } from "~/api/types/sound/sound-with-category";
import type { LobbyWithParticipants } from "~/api/types/lobby/lobby-with-participants";
import { LobbyState } from "~/api/types/enums/lobby-state";

interface WaitingProps {
  lobbyId: string;
  isOwner: boolean;
  participants: Participation[];
  setLobby: React.Dispatch<React.SetStateAction<LobbyWithParticipants | null>>;
  setSounds: React.Dispatch<React.SetStateAction<SoundWithCategory[]>>;
}

export function Waiting({
  lobbyId,
  isOwner,
  participants,
  setLobby,
  setSounds,
}: WaitingProps) {
  const startLobbyMutation = useStartLobby();
  const { connection } = use(RealtimeContext);

  useEffect(() => {
    if (!connection) return;

    function handleStarted(startedSounds: SoundWithCategory[]) {
      setLobby((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          state: LobbyState.Submitting,
          submissionStartedAt: new Date().toISOString(),
        };
      });
      setSounds(startedSounds);
    }

    connection.on("Started", handleStarted);

    return () => {
      connection.off("Started", handleStarted);
    };
  }, [connection, setLobby, setSounds]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Not Started</h2>
      {isOwner ? (
        participants.length > 1 ? (
          <MutationBoundary mutation={startLobbyMutation}>
            <LoadingButton
              onClick={() => startLobbyMutation.mutate(lobbyId)}
              isPending={startLobbyMutation.isPending}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white font-semibold"
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
