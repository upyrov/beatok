import { Button } from "~/components/ui/button";
import { useState } from "react";
import { CgSpinner, CgPlayButtonO, CgEnter, CgHeadset, CgTrophy, CgArrowRight } from "react-icons/cg";
import { Link, redirect } from "react-router";
import { lobbiesQueryOptions, useLobbies } from "~/api/lobby";
import { userQueryOptions } from "~/api/user";
import { Knob } from "~/components/knob";
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
    { property: "og:title", content: "Beatok | Beat Battle" },
    {
      property: "og:description",
      content:
        "Discover and join active beat battle lobbies. Compete with others and rise to the top.",
    },
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Beatok",
        url: "https://beatok.net",
      },
    },
  ];
}

export async function clientLoader() {
  const queryClient = getQueryClient();
  try {
    const user = await queryClient.fetchQuery(userQueryOptions());
    if (user) {
      throw redirect("/lobbies");
    }
  } catch (e) {
    if (e instanceof Response) throw e;
  }
  await queryClient.prefetchQuery(lobbiesQueryOptions());
}

export function HydrateFallback() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center transition duration-300 starting:opacity-0 starting:translate-y-1">
      <CgSpinner className="animate-spin text-gray-400" size={48} />
    </div>
  );
}

export default function LandingPage() {
  const lobbiesQuery = useLobbies();
  const lobbies = lobbiesQuery.data ?? [];
  const activeLobbies = lobbies.filter((l) => !l.isJoined).slice(0, 3);

  const [vote, setDemoVote] = useState(5);

  return (
    <div className="flex flex-col flex-1">
      <section className="flex flex-col items-center justify-center pt-32 pb-24 px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-linear-to-br from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 bg-clip-text text-transparent transition duration-300 starting:opacity-0 starting:translate-y-1">
          Beat Battle
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mb-10 transition duration-300 starting:opacity-0 starting:translate-y-1 delay-100">
          Prove your production skills against the world. Join a lobby, craft
          your masterpiece with random sounds, and climb the global rankings.
        </p>
        <div className="flex gap-4 transition duration-300 starting:opacity-0 starting:translate-y-1 delay-200">
          <Link viewTransition to="/lobbies">
            <Button className="flex items-center gap-2 px-12 py-5 text-xl font-bold bg-blue-600 hover:bg-blue-500 border-none">
              <CgPlayButtonO /> Start
            </Button>
          </Link>
        </div>
      </section>

      <section className="bg-muted py-24 px-4 border-y border-muted-border">
        <PageContainer className="max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-400/10 flex items-center justify-center text-red-400 font-bold text-2xl mb-6">
                <CgEnter />
              </div>
              <h3 className="text-xl font-bold mb-3">Join & Get Sounds</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Jump into an active lobby. When the countdown hits zero, you'll
                be assigned a selection of{" "}
                <strong className="text-gray-900 dark:text-gray-100">
                  completely random sounds
                </strong>{" "}
                that you must incorporate into your beat.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 font-bold text-2xl mb-6">
                <CgHeadset />
              </div>
              <h3 className="text-xl font-bold mb-3">Make the Beat</h3>
              <p className="text-gray-600 dark:text-gray-400">
                You have a strict time limit. Work fast in your DAW, export your
                beat, and upload it before the timer runs out.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 font-bold text-2xl mb-6">
                <CgTrophy />
              </div>
              <h3 className="text-xl font-bold mb-3">Vote &amp; Win</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Listen to everyone's submissions anonymously. Rate them, and the
                highest score wins the battle.
              </p>
            </div>
          </div>
        </PageContainer>
      </section>

      {activeLobbies.length > 0 && (
        <section className="bg-muted py-24 px-4 border-y border-muted-border flex-1">
          <PageContainer className="max-w-6xl">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-bold">Live Battles</h2>
              <Link
                viewTransition
                to="/dashboard"
                className="text-blue-500 font-medium hover:underline"
              >
                <span className="flex items-center gap-1">View all lobbies <CgArrowRight /></span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activeLobbies.map((lobby) => (
                <div
                  key={lobby.id}
                  className="system-panel p-6 rounded-xl flex flex-col gap-4 opacity-80 hover:opacity-100 transition duration-300"
                >
                  <div>
                    <span className="text-sm text-gray-500">
                      Host: {lobby.owner.name}
                    </span>
                    <h3 className="text-xl font-bold line-clamp-1">
                      {lobby.name}
                    </h3>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Genre</span>
                    <span className="font-medium">{lobby.genre.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Players</span>
                    <span className="font-medium">
                      {lobby.participantCount} / {lobby.participantLimit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </PageContainer>
        </section>
      )}

      <section className="py-24 px-4">
        <PageContainer className="max-w-4xl flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 flex flex-col gap-6">
            <h2 className="text-3xl font-bold tracking-tight">Voting</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              We ditched the boring ratings. When it's time to judge a beat,
              you'll dial in your score using our analog knob. Go ahead, give it
              a spin right now!
            </p>
          </div>
          <div className="system-panel p-12 flex flex-col items-center justify-center gap-6 rounded-2xl">
            <Knob
              value={vote}
              onChange={setDemoVote}
              min={0}
              max={10}
              size={120}
              color={vote >= 8 ? "#4ade80" : vote >= 4 ? "#fb923c" : "#f87171"}
            />
            <div className="text-4xl font-bold font-mono w-24 text-center">
              {vote}
            </div>
          </div>
        </PageContainer>
      </section>
    </div>
  );
}
