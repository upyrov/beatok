import { useStartLobby } from "~/api/lobbies";
import { MutationBoundary } from "~/components/error/mutation-boundary";
import { LoadingButton } from "~/components/loading";

interface WaitingProps {
  lobbyId: string;
  isOwner: boolean;
}

export function Waiting({ lobbyId, isOwner }: WaitingProps) {
  const startLobbyMutation = useStartLobby();

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Lobby Not Started</h2>
      {isOwner ? (
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
        <p className="text-gray-400">Waiting for host to start...</p>
      )}
    </div>
  );
}
