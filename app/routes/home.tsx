import { useMemo } from "react";
import { Link } from "react-router";
import { lobbiesQueryOptions, useLobbies } from "~/api/lobby";
import type { Lobby } from "~/api/types/lobby/lobby";
import { Button } from "~/components/button";
import { Card } from "~/components/card";
import { LobbyCard } from "~/components/lobby-card";
import { PageContainer } from "~/components/page-container";
import { QueryBoundary } from "~/components/query-boundary";
import { getQueryClient } from "~/lib/query-client";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Beatok" }, { name: "description", content: "Beat battle" }];
}

export async function clientLoader() {
  const queryClient = getQueryClient();
  await queryClient.ensureQueryData(lobbiesQueryOptions());
}

export default function Home() {
  const lobbiesQuery = useLobbies();

  return (
    <PageContainer className="max-w-7xl">
      <QueryBoundary query={lobbiesQuery}>
        {(lobbies) => {
          const { toRejoin, active } = useMemo(
            () =>
              lobbies.reduce<{
                toRejoin: Lobby[];
                active: Lobby[];
              }>(
                (acc, lobby) => {
                  if (lobby.isJoined) acc.toRejoin.push(lobby);
                  else acc.active.push(lobby);
                  return acc;
                },
                { toRejoin: [], active: [] },
              ),
            [lobbies],
          );

          return (
            <>
              {toRejoin.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="flex items-center gap-2">
                      Lobbies to Rejoin
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {toRejoin.map((lobby) => (
                      <Card key={lobby.id} className="flex flex-col p-5">
                        <LobbyCard lobby={lobby} />
                        <div className="mt-6">
                          <Link to={`/lobbies/${lobby.id}`} prefetch="intent">
                            <Button>Join</Button>
                          </Link>
                        </div>
                      </Card>
                    ))}
                  </div>
                </section>
              )}

              <section>
                {!!active.length && (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="flex items-center gap-2">Lobbies</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {active.map((lobby) => (
                        <Card key={lobby.id} className="flex flex-col p-5">
                          <LobbyCard lobby={lobby} />
                          <div className="mt-6">
                            <Link to={`/lobbies/${lobby.id}`} prefetch="intent">
                              <Button>Join</Button>
                            </Link>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </>
                )}

                {!active.length && (
                  <div className="flex justify-center items-center flex-col">
                    <p>No active lobbies found</p>
                    <p className="mt-1 text-gray-500">Check back later or</p>
                    <Link
                      to="/lobbies/new"
                      prefetch="intent"
                      className="flex justify-center p-2"
                    >
                      <Button>Create your own</Button>
                    </Link>
                  </div>
                )}
              </section>
            </>
          );
        }}
      </QueryBoundary>
    </PageContainer>
  );
}
