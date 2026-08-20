import {
  CgCalendarDates,
  CgMusicNote,
  CgTrophy,
  CgUserList,
} from "react-icons/cg";
import type { ArchivedLobby } from "~/api/types/lobby";
import { formatDate } from "~/lib/time";

interface ArchivedLobbyCardProps {
  lobby: ArchivedLobby;
}

export function ArchivedLobbyCard({ lobby }: ArchivedLobbyCardProps) {
  return (
    <div className="flex flex-col h-full relative">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h3
            className="text-xl font-bold tracking-tight text-foreground truncate"
            title={lobby.name}
          >
            {lobby.name}
          </h3>
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1.5">
            <CgCalendarDates className="opacity-70 text-base shrink-0" />
            <span>{formatDate(lobby.createdAt)}</span>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-muted rounded-lg text-xs font-semibold text-foreground border border-muted-border">
          <CgMusicNote /> {lobby.genre.name}
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-auto">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-gray-500">
            <CgUserList className="text-base" /> Players
          </span>
          <span className="font-medium text-foreground">
            {lobby.participantCount}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-gray-500">
            <CgTrophy className="text-base" /> Result
          </span>
          <span
            className={`font-medium ${lobby.isWinner ? "text-yellow-500" : "text-gray-500"}`}
          >
            {lobby.isWinner ? "Winner" : "Participant"}
          </span>
        </div>

        <div className="mt-2 flex flex-col gap-1.5">
          <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider text-gray-400">
            <span>Created</span>
            <span>Ended</span>
          </div>
          <div className="flex gap-1 h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500/80 rounded-full"
              style={{ flex: 1 }}
              title="Waiting"
            />
            <div
              className="h-full bg-orange-500/80 rounded-full"
              style={{ flex: 2 }}
              title="Submission Phase"
            />
            <div
              className="h-full bg-green-500/80 rounded-full"
              style={{ flex: 1 }}
              title="Voting Phase"
            />
          </div>
        </div>
      </div>

      {lobby.isWinner && (
        <div className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-900">
          <CgTrophy size={16} />
        </div>
      )}
    </div>
  );
}
