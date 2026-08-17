import { CgUser, CgMusicNote, CgCalendarDates, CgTimer, CgUserList } from "react-icons/cg";
import type { Lobby } from "~/api/types/lobby";

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
      <div>
        <span className="text-sm flex items-center gap-1.5"><CgUser /> {lobby.owner.name}</span>
        <div className="flex justify-between items-start">
          <h3>{lobby.name}</h3>
          <span className="flex items-center gap-1.5"><CgMusicNote /> {lobby.genre.name}</span>
        </div>
      </div>

      <div className="grow">
        <div className="flex justify-between items-center mb-1">
          <span className="flex items-center gap-1.5"><CgCalendarDates /> Created</span>
          <span>{createdAt}</span>
        </div>
        <div className="flex justify-between items-center mb-1">
          <span className="flex items-center gap-1.5"><CgTimer /> Submission By</span>
          <span>{lobby.submissionTime}</span>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="flex items-center gap-1.5"><CgUserList /> Players</span>
            <span>
              {lobby.participantCount} / {lobby.participantLimit}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
