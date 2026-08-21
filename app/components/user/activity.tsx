import { useActivity } from "~/api/user";
import {
  CgCalendarDates,
  CgMusicNote,
  CgTrophy,
  CgUserList,
} from "react-icons/cg";
import { formatDate } from "~/lib/time";

export function Activity({ userId, date }: { userId: string; date: string }) {
  const { data: activity, isLoading } = useActivity(userId, date);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="system-skeleton h-48 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!activity || !activity.length) {
    return <div className="py-4 text-gray-400">No activity on this date.</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activity.map((lobby) => (
          <div
            key={lobby.id}
            className="bg-black/5 dark:bg-white/5 border border-muted-border p-4 rounded-xl block"
          >
            <div className="flex flex-col h-full relative">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3
                    className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2"
                    title={lobby.name}
                  >
                    <span className="truncate">{lobby.name}</span>
                    {lobby.isWinner && (
                      <span className="text-yellow-500 flex items-center shrink-0" title="Winner">
                        <CgTrophy size={18} />
                      </span>
                    )}
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

                {(() => {
                  const tCreated = new Date(lobby.createdAt).getTime();
                  const tEnded = new Date(lobby.endedAt).getTime();
                  let tSub = new Date(lobby.submissionStartedAt).getTime();
                  let tVote = new Date(lobby.votingStartedAt).getTime();

                  if (tSub < 0 || tSub < tCreated) tSub = tEnded;
                  if (tVote < 0 || tVote < tSub) tVote = tEnded;

                  const waitMins = Math.max(0, Math.round((tSub - tCreated) / 60000));
                  const subMins = Math.max(0, Math.round((tVote - tSub) / 60000));
                  const voteMins = Math.max(0, Math.round((tEnded - tVote) / 60000));

                  return (
                    <div className="mt-2 flex flex-col gap-2">
                      <div className="flex items-center w-full">
                        <div
                          className="h-1.5 bg-black/10 dark:bg-white/10 rounded-l-full"
                          style={{ flex: Math.max(1, waitMins) }}
                          title="Waiting"
                        />
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-400 dark:bg-gray-500 shrink-0 -mx-[5px] z-10" />
                        <div
                          className="h-1.5 bg-black/10 dark:bg-white/10"
                          style={{ flex: Math.max(1, subMins) }}
                          title="Submission Phase"
                        />
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-400 dark:bg-gray-500 shrink-0 -mx-[5px] z-10" />
                        <div
                          className="h-1.5 bg-black/10 dark:bg-white/10 rounded-r-full"
                          style={{ flex: Math.max(1, voteMins) }}
                          title="Voting Phase"
                        />
                      </div>
                      <div className="flex text-[10px] uppercase font-bold tracking-wider text-gray-500">
                        <span className="w-0 flex-1 text-left">{waitMins}m wait</span>
                        <span className="w-0 flex-1 text-center">{subMins}m sub</span>
                        <span className="w-0 flex-1 text-right">{voteMins}m vote</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
