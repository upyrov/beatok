import { CgLogIn, CgMathPlus } from "react-icons/cg";
import { Button } from "~/components/ui/button";
import { useMemo } from "react";
import { Link } from "react-router";
import { lobbiesQueryOptions, useLobbies } from "~/api/lobby";
import type { Lobby } from "~/api/types/lobby";
import { LobbyCard } from "~/components/lobby-card";
import { PageContainer } from "~/components/page-container";
import { getQueryClient } from "~/lib/query-client";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Beatok | Beat Battle" },
    {
      name: "description",
      content:
        "Discover and join active beat battle lobbies. Compete with others and rise to the top.",
    },
  ];
}

export async function clientLoader() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(lobbiesQueryOptions());
}

function LobbyGridItem({ lobby }: { lobby: Lobby }) {
  return (
    <div className="system-card flex flex-col p-5">
      <LobbyCard lobby={lobby} />
      <div className="mt-6">
        <Link viewTransition to={`/lobbies/${lobby.id}`} prefetch="intent">
          <Button className="flex items-center gap-2"><CgLogIn /> Join</Button>
        </Link>
      </div>
    </div>
  );
}

function HomeSkeleton() {
  return (
    <section className="flex flex-col flex-1">
      <div className="flex items-center justify-between mb-6">
        <div className="system-skeleton w-32 h-8" />
      </div>
      <div className="system-grid-list">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col p-5 bg-muted border border-muted-border rounded-xl"
          >
            <div className="flex flex-col gap-4">
              <div>
                <div className="system-skeleton w-24 h-4 mb-2" />
                <div className="flex justify-between items-start">
                  <div className="system-skeleton w-32 h-6" />
                  <div className="system-skeleton w-16 h-5" />
                </div>
              </div>
              <div className="grow flex flex-col gap-2 mt-4">
                <div className="flex justify-between">
                  <div className="system-skeleton w-16 h-4" />
                  <div className="system-skeleton w-24 h-4" />
                </div>
                <div className="flex justify-between">
                  <div className="system-skeleton w-24 h-4" />
                  <div className="system-skeleton w-16 h-4" />
                </div>
                <div className="flex justify-between">
                  <div className="system-skeleton w-16 h-4" />
                  <div className="system-skeleton w-12 h-4" />
                </div>
              </div>
            </div>
            <div className="mt-6">
              <div className="system-skeleton w-full h-10 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function HydrateFallback() {
  return (
    <PageContainer className="max-w-7xl">
      <HomeSkeleton />
    </PageContainer>
  );
}

export default function Home() {
  const lobbiesQuery = useLobbies();
  const lobbies = lobbiesQuery.data ?? [];

  const { toRejoin, active } = useMemo(() => {
    return lobbies.reduce<{
      toRejoin: Lobby[];
      active: Lobby[];
    }>(
      (acc, lobby) => {
        if (lobby.isJoined) acc.toRejoin.push(lobby);
        else acc.active.push(lobby);
        return acc;
      },
      { toRejoin: [], active: [] },
    );
  }, [lobbies]);

  return (
    <PageContainer className="max-w-7xl">
      {toRejoin.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="flex items-center gap-2">Lobbies to Rejoin</h2>
          </div>
          <div className="system-grid-list">
            {toRejoin.map((lobby) => (
              <LobbyGridItem key={lobby.id} lobby={lobby} />
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col flex-1">
        {!!active.length && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="flex items-center gap-2">Lobbies</h2>
            </div>
            <div className="system-grid-list">
              {active.map((lobby) => (
                <LobbyGridItem key={lobby.id} lobby={lobby} />
              ))}
            </div>
          </>
        )}

        {!active.length && (
          <div className="flex justify-center items-center flex-col flex-1 text-center">
            <p className="text-xl font-medium">No Lobbies Found</p>
            <p className="mt-2 text-gray-500">Check back later or</p>
            <Link
              viewTransition
              to="/lobbies/new"
              prefetch="intent"
              className="mt-4 flex justify-center"
            >
              <Button className="flex items-center gap-2"><CgMathPlus /> Create Your Own</Button>
            </Link>
          </div>
        )}
      </section>
    </PageContainer>
  );
}
