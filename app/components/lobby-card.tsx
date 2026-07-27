import type { Lobby } from "~/api/types/lobby/lobby";

interface LobbyCardProps {
  lobby: Lobby;
}

export function LobbyCard({ lobby }: LobbyCardProps) {
  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const createdAt = dateFormatter.format(new Date(lobby.createdAt));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div>
          <h3>{lobby.name}</h3>
          <p>
            Host: <span>{lobby.owner.name}</span>
          </p>
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
          <span>{lobby.submissionTime}</span>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span>Players</span>
            <span>
              {lobby.participantCount} / {lobby.participantLimit}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
