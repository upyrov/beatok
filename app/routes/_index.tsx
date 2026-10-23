import { ArrowRight, PlayCircle } from "@phosphor-icons/react";
import { useState } from "react";
import { Link } from "react-router";
import { lobbiesQueryOptions, useLobbies } from "~/api/lobby";
import { userQueryOptions } from "~/api/user";
import { Knob } from "~/components/knob";
import { LobbyCard } from "~/components/lobby-card";
import { PageContainer } from "~/components/page-container";
import { Button } from "~/components/ui/button";
import { getQueryClient } from "~/lib/query-client";

export function meta() {
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
  // Kick off both fetches in parallel without blocking render
  queryClient.prefetchQuery(userQueryOptions());
  queryClient.prefetchQuery(lobbiesQueryOptions());
  return null;
}

function HeroSection() {
  return (
    <>
      <section className="relative flex flex-col justify-center pt-32 pb-24 px-4 overflow-hidden">
        {/* Ambient background — warm studio lighting feel */}
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute -top-64 right-0 w-[50rem] h-[50rem] rounded-full bg-amber-400/5 blur-3xl" />
          <div className="absolute top-48 -left-48 w-[31.25rem] h-[31.25rem] rounded-full bg-orange-300/[0.04] blur-3xl" />
        </div>

        <div className="max-w-6xl w-full mx-auto">
          <p className="text-xs font-bold tracking-[0.18em] uppercase text-amber-600 dark:text-amber-500 mb-5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] starting:opacity-0">
            Beat Battle Platform
          </p>
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-6 leading-[0.92] max-w-2xl text-gray-950 dark:text-white transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] starting:opacity-0 starting:translate-y-3 text-wrap-balance">
            Make beats.
            <br />
            Earn your rank.
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-lg mb-10 leading-relaxed transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] delay-100 starting:opacity-0 starting:translate-y-2 text-wrap-pretty">
            Join a timed lobby, get your random sounds, and submit before the
            clock runs out. Anonymous voting — no bias, just the music.
          </p>
          <div className="flex gap-3 transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] delay-200 starting:opacity-0 starting:translate-y-2">
            <Link viewTransition to="/lobbies">
              <Button className="flex items-center gap-2 px-8 py-5 text-base font-bold bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black border-none shadow-[0_4px_24px_rgba(245,158,11,0.22)]">
                <PlayCircle className="text-xl" /> Join a lobby
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-muted py-24 px-4 border-y border-muted-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-16 gap-y-12">
            <div className="flex flex-col gap-4">
              <span className="text-7xl font-black leading-none text-black/[0.07] dark:text-white/[0.07] select-none tabular-nums">
                01
              </span>
              <h3 className="text-lg font-bold">Join & get sounds</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Jump into an active lobby. When the countdown hits zero, you get
                a set of{" "}
                <strong className="text-gray-900 dark:text-gray-100">
                  completely random sounds
                </strong>{" "}
                to incorporate into your beat.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <span className="text-7xl font-black leading-none text-black/[0.07] dark:text-white/[0.07] select-none tabular-nums">
                02
              </span>
              <h3 className="text-lg font-bold">Make the beat</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                You have a strict time limit. Work fast in your DAW, export your
                beat, and upload it before the timer runs out.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <span className="text-7xl font-black leading-none text-black/[0.07] dark:text-white/[0.07] select-none tabular-nums">
                03
              </span>
              <h3 className="text-lg font-bold">Vote & win</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Listen to every submission anonymously. Rate them on our analog
                knob — highest score wins the battle.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function LandingPage() {
  const lobbiesQuery = useLobbies();
  const lobbies = lobbiesQuery.data ?? [];
  const activeLobbies = lobbies.filter((l) => !l.isJoined).slice(0, 3);

  const [vote, setDemoVote] = useState(5);

  return (
    <div className="flex flex-col flex-1">
      <HeroSection />

      {(activeLobbies.length > 0 || lobbiesQuery.isLoading) && (
        <section className="bg-muted py-24 px-4 border-y border-muted-border flex-1">
          <PageContainer className="max-w-6xl">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">
                  Active Lobbies
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Jump into a battle that's accepting participants right now.
                </p>
              </div>
              <Link
                viewTransition
                to="/lobbies"
                className="text-amber-600 dark:text-amber-500 font-medium hover:underline"
              >
                <span className="flex items-center gap-1">
                  View all lobbies <ArrowRight />
                </span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {lobbiesQuery.isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex flex-col p-5 bg-muted border border-muted-border rounded-xl"
                    >
                      <div className="mb-6 flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-2">
                          <div className="system-skeleton w-32 h-6" />
                          <div className="system-skeleton w-24 h-4" />
                        </div>
                        <div className="system-skeleton w-16 h-6 rounded-lg shrink-0" />
                      </div>

                      <div className="flex flex-col gap-3 mt-auto">
                        <div className="flex items-center justify-between">
                          <div className="system-skeleton w-20 h-4" />
                          <div className="system-skeleton w-24 h-4" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="system-skeleton w-28 h-4" />
                          <div className="system-skeleton w-16 h-4" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="system-skeleton w-16 h-4" />
                          <div className="system-skeleton w-12 h-4" />
                        </div>
                      </div>
                    </div>
                  ))
                : activeLobbies.map((lobby) => (
                    <Link
                      key={lobby.id}
                      viewTransition
                      to={`/lobbies/${lobby.id}`}
                      style={{ viewTransitionName: `lobby-${lobby.id}` }}
                      className="system-card-interactive flex flex-col p-5"
                    >
                      <LobbyCard lobby={lobby} />
                    </Link>
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
