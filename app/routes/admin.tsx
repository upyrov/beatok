import { redirect, useOutletContext } from "react-router";
import { genresQueryOptions } from "~/api/genre";
import { kitsQueryOptions } from "~/api/kit";
import type { Me } from "~/api/types/user";
import { Genres } from "~/components/admin/genres";
import { Kits } from "~/components/admin/kits";
import { PageContainer } from "~/components/page-container";
import { getQueryClient } from "~/lib/query-client";
import type { Route } from "./+types/admin";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Beatok | Admin" },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

function AdminListSkeleton() {
  return (
    <div className="system-card">
      <div className="flex flex-col gap-6 flex-1">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="system-skeleton flex-1 h-10 rounded" />
            <div className="system-skeleton w-10 h-10 rounded" />
          </div>
        </div>
        <ul className="flex flex-col gap-4">
          <li className="flex flex-col gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="system-skeleton w-full h-14 rounded-lg" />
            ))}
          </li>
        </ul>
      </div>
    </div>
  );
}

export function HydrateFallback() {
  return (
    <PageContainer className="max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AdminListSkeleton />
        <AdminListSkeleton />
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
            <div className="system-card">
              <Genres />
            </div>
            <div className="system-card">
              <Kits />
            </div>
          </div>
        </PageContainer>
      </>
    )
  );
}
