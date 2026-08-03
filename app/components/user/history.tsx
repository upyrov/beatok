import { useState } from "react";
import { Link } from "react-router";
import { useHistory } from "~/api/user";
import { Fallback } from "~/components/fallback";
import { LobbyCard } from "~/components/lobby-card";

export function History({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const { data: history, isLoading } = useHistory(userId, page);

  if (isLoading) {
    return (
      <div className="py-4">
        <Fallback />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {history?.items.length !== 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {history?.items.map((lobby) => (
            <Link
              key={lobby.id}
              to={`/lobbies/${lobby.id}`}
              className="bg-white/5 hover:bg-white/10 transition-colors border border-white/10 p-4 rounded-xl block"
            >
              <LobbyCard lobby={lobby} />
            </Link>
          ))}
        </div>
      )}

      {history && history.totalCount > 25 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-400">
            Page {page} of {Math.ceil(history.totalCount / 25)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(history.totalCount / 25)}
            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
