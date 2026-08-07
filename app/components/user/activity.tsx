import { Link } from "react-router";
import { useActivity } from "~/api/user";
import { LobbyCard } from "~/components/lobby-card";
import { Skeleton } from "~/components/skeleton";

export function Activity({ userId, date }: { userId: string; date: string }) {
  const { data: activity, isLoading } = useActivity(userId, date);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
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
          <Link
            key={lobby.id}
            to={`/lobbies/${lobby.id}`}
            className="bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-black/10 dark:bg-white/10 transition-colors border border-black/10 dark:border-white/10 p-4 rounded-xl block"
          >
            <LobbyCard lobby={lobby} />
          </Link>
        ))}
      </div>
    </div>
  );
}
