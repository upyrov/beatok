import { redirect, useOutletContext } from "react-router";
import { genresQueryOptions } from "~/api/genre";
import { kitsQueryOptions } from "~/api/kit";
import type { Me } from "~/api/types/user/me";
import { Genres } from "~/components/admin/genres";
import { Kits } from "~/components/admin/kits";
import { Card } from "~/components/card";
import { PageContainer } from "~/components/page-container";
import { Skeleton } from "~/components/skeleton";
import { getQueryClient } from "~/lib/query-client";
import type { Route } from "./+types/admin";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Beatok | Admin" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

export function HydrateFallback() {
  return (
    <PageContainer className="max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <div className="flex flex-col gap-6 flex-1">
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <Skeleton className="flex-1 h-10 rounded" />
                <Skeleton className="w-10 h-10 rounded" />
              </div>
            </div>
            <ul className="flex flex-col gap-4">
              <li className="flex flex-col gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="w-full h-12 rounded-lg" />
                ))}
              </li>
            </ul>
          </div>
        </Card>
        <Card>
          <div className="flex flex-col gap-6 flex-1">
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <Skeleton className="flex-1 h-10 rounded" />
                <Skeleton className="w-10 h-10 rounded" />
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <Skeleton className="w-16 h-5" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="w-20 h-7 rounded" />
                ))}
              </div>
            </div>
            <ul className="flex flex-col gap-4">
              <li className="flex flex-col gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="w-full h-16 rounded-lg" />
                ))}
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}

export async function clientLoader() {
  try {
    await Promise.all([
      getQueryClient().ensureQueryData(genresQueryOptions()),
      getQueryClient().ensureQueryData(kitsQueryOptions()),
    ]);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      throw redirect("/signin");
    }
    throw error;
  }
}

export default function Admin() {
  const { user } = useOutletContext<{ user: Me | null }>();

  return (
    user && (
      <>
        <PageContainer className="max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <Genres />
            </Card>
            <Card>
              <Kits />
            </Card>
          </div>
        </PageContainer>
      </>
    )
  );
}
