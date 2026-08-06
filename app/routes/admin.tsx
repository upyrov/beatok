import { Link, useOutletContext } from "react-router";
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
  await Promise.all([
    getQueryClient().prefetchQuery(genresQueryOptions()),
    getQueryClient().prefetchQuery(kitsQueryOptions()),
  ]);
}

export default function Admin() {
  const { user } = useOutletContext<{ user: Me | null }>();

  return (
    user && (
      <>
        <PageContainer className="max-w-7xl">
          <header className="flex justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold bg-linear-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-400 font-medium">
                Manage kits, categories, sounds, and genres
              </p>
            </div>
            <Link
              to="/"
              prefetch="intent"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-medium text-sm"
            >
              Back to App
            </Link>
          </header>

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
