import {
  CalendarDots,
  MusicNote,
  Timer,
  User,
  Users,
} from "@phosphor-icons/react";
import type { Lobby } from "~/api/types/lobby";
import { formatDate, formatDuration } from "~/lib/time";

interface LobbyCardProps {
  lobby: Lobby;
}

export function LobbyCard({ lobby }: LobbyCardProps) {
  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h3
            className="text-xl font-bold tracking-tight text-foreground truncate"
            title={lobby.name}
          >
            {lobby.name}
          </h3>
          <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1.5">
            <User className="opacity-70 text-base shrink-0" />
            <span>
              Hosted by{" "}
              <span className="font-medium text-foreground">
                {lobby.owner.name}
              </span>
            </span>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-muted rounded-lg text-xs font-semibold text-foreground border border-muted-border">
          <MusicNote /> {lobby.genre.name}
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-auto">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-gray-500">
            <CalendarDots className="text-base" /> Created
          </span>
          <span className="font-medium text-foreground">
            {formatDate(lobby.createdAt)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-gray-500">
            <Timer className="text-base" /> Submission By
          </span>
          <span className="font-medium text-foreground font-mono tabular-nums">
            {formatDuration(lobby.submissionTime)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-gray-500">
            <Users className="text-base" /> Players
          </span>
          <span className="font-medium text-foreground font-mono tabular-nums">
            {lobby.participantCount}{" "}
            <span className="text-gray-400 font-normal font-mono">
              / {lobby.participantLimit}
            </span>
          </span>
        </div>
      </div>
    </>
  );
}
