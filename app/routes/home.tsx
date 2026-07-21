import { Link } from "react-router";
import type { Route } from "./+types/home";
import { useLobbies, useJoinLobby, lobbiesQueryOptions } from "~/api/lobbies";
import { LobbyCard } from "~/components/lobby-card";
import { QueryBoundary } from "~/components/query-boundary";
import { getQueryClient } from "~/lib/query-client";

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
  const joinLobby = useJoinLobby();

  return (
    <main className="container mx-auto p-4 md:p-8 space-y-8 max-w-7xl min-h-screen">
      <header className="flex justify-between items-center p-6">
        <div>
          <h1>Beatok</h1>
          <p className="mt-2">Find your perfect beat making session</p>
        </div>
        <Link to="/create-lobby" className="px-4 py-2 bg-gray-200 hover:bg-gray-300">
          Create Lobby
        </Link>
      </header>
      
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="flex items-center gap-2">
            Available Lobbies
          </h2>
        </div>
        
        <QueryBoundary query={lobbiesQuery}>
          {(lobbies) => (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {lobbies.map((lobby) => (
                <LobbyCard 
                  key={lobby.id} 
                  lobby={lobby} 
                  onJoin={(id) => joinLobby.mutate(id)} 
                />
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
