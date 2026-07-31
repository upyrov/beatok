import { Link, useOutletContext } from "react-router";
import type { Route } from "./+types/home";
import { useLobbies, lobbiesQueryOptions } from "~/api/lobbies";
import { LobbyCard } from "~/components/lobby-card";
import { QueryBoundary } from "~/components/error/query-boundary";
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

const CR_BUTTON_CLASSES =
  "px-4 py-1.5 h-auto min-h-[28px] bg-linear-to-b from-[#5c656d] to-[#495158] hover:from-[#656e76] hover:to-[#515961] active:from-[#434a51] active:to-[#3e444a] border border-[#2b3035] rounded text-[#e0e4e8] text-[13px] font-medium flex items-center justify-center cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,0.3)] active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)] transition-colors duration-100";

export default function Home() {
  const lobbiesQuery = useLobbies();

  return (
    <main className="container mx-auto p-4 md:p-8 space-y-8 max-w-7xl flex-1 w-full">
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="flex items-center gap-2">Lobbies</h2>
        </div>

        <QueryBoundary query={lobbiesQuery}>
          {(lobbies) => (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {lobbies.map((lobby) => (
                <div
                  key={lobby.id}
                  className="flex flex-col border border-gray-200 rounded-xl p-5 bg-white shadow-sm"
                >
                  <LobbyCard lobby={lobby} />
                  <div className="mt-6">
                    <Link
                      to={`/lobbies/${lobby.id}`}
                      className={`w-full ${CR_BUTTON_CLASSES}`}
                    >
                      Join
                    </Link>
                  </div>
                </div>
              ))}
              {lobbies.length === 0 && (
                <div className="col-span-full py-12 text-center">
                  <p>No active lobbies found</p>
                  <p className="mt-1 text-gray-500">
                    Check back later or create your own
                  </p>
                </div>
              )}
            </div>
          )}
        </QueryBoundary>
      </section>
    </main>
  );
}
