import { redirect } from "react-router";
import { genresQueryOptions } from "~/api/genre";
import { kitsQueryOptions } from "~/api/kit";
import { Genres } from "~/components/admin/genres";
import { Kits } from "~/components/admin/kits";
import { PageContainer } from "~/components/page-container";
import { getQueryClient } from "~/lib/query-client";
import { useUserStore } from "~/stores/user";
import type { Route } from "./+types/admin";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Beatok | Admin" },
    { name: "robots", content: "noindex, nofollow" },
  ];
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
  return null;
}

export default function Admin() {
  const user = useUserStore((s) => s.user);

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
