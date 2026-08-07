import { useOutletContext, redirect } from "react-router";
import { genresQueryOptions } from "~/api/genre";
import { kitsQueryOptions } from "~/api/kit";
import type { Me } from "~/api/types/user/me";
import { Genres } from "~/components/admin/genres";
import { Kits } from "~/components/admin/kits";
import { Card } from "~/components/card";
import { PageContainer } from "~/components/page-container";
import { getQueryClient } from "~/lib/query-client";
import type { Route } from "./+types/admin";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Beatok | Admin" }];
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
