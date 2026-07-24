import { useEffect, useState } from "react";
import { useOutletContext, Link, useNavigate } from "react-router";
import type { Route } from "./+types/admin";
import { UserRole } from "~/api/types/enums/user-role";
import type { User } from "~/api/types/user/user";
import { Kits } from "~/components/kits";
import { getQueryClient } from "~/lib/query-client";
import { genresQueryOptions } from "~/api/genres";
import { kitsQueryOptions } from "~/api/kits";

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
  const { user } = useOutletContext<{ user: User | null }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== UserRole.Administrator) {
      navigate("/");
    }
  }, [user]);

  return (
    user && (
      <div className="container mx-auto p-4 md:p-8 max-w-4xl min-h-screen flex flex-col gap-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-white/60 mt-1">
              Manage kits, categories, and sounds
            </p>
          </div>
          <Link
            to="/"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            Back to App
          </Link>
        </header>

        <div className="flex-1">
          <Kits />
        </div>
      </div>
    )
  );
}
