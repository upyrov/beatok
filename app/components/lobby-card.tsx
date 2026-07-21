import type { Lobby } from "~/api/types/lobby/lobby";

interface LobbyCardProps {
  lobby: Lobby;
  onJoin?: (id: string) => void;
}

export function LobbyCard({ lobby, onJoin }: LobbyCardProps) {
  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const createdAt = dateFormatter.format(new Date(lobby.createdAt));
  const submissionTime = dateFormatter.format(new Date(lobby.submissionTimeLimit));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div>
          <h3>{lobby.name}</h3>
          <p>Host: <span>{lobby.owner.name}</span></p>
        </div>
        <span>{lobby.genre.name}</span>
      </div>
      
      <div className="grow">
        <div className="flex justify-between items-center mb-1">
          <span>Created</span>
          <span>{createdAt}</span>
        </div>
        <div className="flex justify-between items-center mb-1">
          <span>Submission By</span>
          <span>{submissionTime}</span>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <span>Players</span>
            <span>{lobby.participantCount} / {lobby.participantLimit}</span>
          </div>
        </div>
      </div>

      <div className="mt-2">
        <button
          onClick={() => onJoin?.(lobby.id)}
          className="w-full flex items-center justify-center gap-2"
        >
          Join Lobby
        </button>
      </div>
    </div>
  );
}
