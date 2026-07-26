import { Link, useOutletContext } from "react-router";
import type { Route } from "./+types/home";
import { useLobbies, lobbiesQueryOptions } from "~/api/lobbies";
import { LobbyCard } from "~/components/lobby-card";
import { QueryBoundary } from "~/components/error/query-boundary";
import { getQueryClient } from "~/lib/query-client";
import type { User } from "~/api/types/user/user";
import { useSignOut } from "~/api/auth";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Beatok" },
    { name: "description", content: "Welcome to Beatok!" },
  ];
}

export async function clientLoader() {
  await getQueryClient().prefetchQuery(lobbiesQueryOptions());
}

export default function Home() {
  const lobbiesQuery = useLobbies();
  const { user } = useOutletContext<{ user: User | null }>();
  const signOutMutation = useSignOut();

  return (
    <main className="container mx-auto p-4 md:p-8 space-y-8 max-w-7xl min-h-screen">
      <header className="flex justify-between items-center p-6">
        <div>
          <h1>Beatok</h1>
          <p className="mt-2">Find your perfect beat making session</p>
        </div>
        {user?.name ? (
          <>
            <span>{user.name}</span>{" "}
            <Link
              to="/create-lobby"
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300"
            >
              Create Lobby
            </Link>
            <button
              onClick={() => signOutMutation.mutate()}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300"
            >
              Sign out
            </button>
          </>
        ) : (
          <Link
            to="/signin"
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300"
          >
            Sign in
          </Link>
        )}
      </header>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="flex items-center gap-2">Available Lobbies</h2>
        </div>

        <QueryBoundary query={lobbiesQuery}>
          {(lobbies) => (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {lobbies.map((lobby) => (
                <div
                  key={lobby.id}
                  className="flex flex-col border border-white/10 rounded-xl p-5 bg-white/5"
                >
                  <LobbyCard lobby={lobby} />
                  <div className="mt-6">
                    <Link
                      to={`/lobbies/${lobby.id}`}
                      className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 py-2 rounded-lg transition-colors"
                    >
                      Join Lobby
                    </Link>
                  </div>
                </div>
              ))}
              {lobbies.length === 0 && (
                <div className="col-span-full py-12 text-center">
                  <p>No active lobbies found</p>
                  <p className="mt-1">Check back later or create your own</p>
                </div>
              )}
            </div>
          )}
        </QueryBoundary>
      </section>
    </main>
  );
}
