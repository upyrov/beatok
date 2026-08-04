import { useState } from "react";
import { useParams } from "react-router";
import {
  commentsQueryOptions,
  useUser,
  useUserById,
  userByIdQueryOptions,
} from "~/api/user";
import { Fallback } from "~/components/fallback";
import { Activity } from "~/components/user/activity";
import { ActivityGraph } from "~/components/user/activity-graph";
import { CommentForm } from "~/components/user/comment-form";
import { CommentList } from "~/components/user/comment-list";
import { Profile } from "~/components/user/profile";
import { getQueryClient } from "~/lib/query-client";
import type { Route } from "./+types/user";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery(userByIdQueryOptions(params.id)),
    queryClient.prefetchQuery(commentsQueryOptions(params.id, 1, 25)),
  ]);
}

export default function User() {
  const { id } = useParams<{ id: string }>();
  const { data: currentUser } = useUser();
  const [selectedYear, setSelectedYear] = useState<number | undefined>();
  const [selectedDate, setSelectedDate] = useState<string | undefined>();

  const { data: user, isLoading: isUserLoading } = useUserById(
    id!,
    selectedYear,
  );

  if (isUserLoading) {
    return <Fallback />;
  }

  if (!id || !user) {
    return <div className="p-8 text-center text-red-500">User not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 flex flex-col gap-8">
      <Profile user={user} isCurrentUser={currentUser?.id === user.id} />
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-200">Activity Graph</h2>
          <select
            value={selectedYear ?? "default"}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedYear(
                value === "default" ? undefined : parseInt(value, 10),
              );
            }}
            className="bg-white/10 rounded-md px-2 py-1 text-sm outline-none cursor-pointer focus:ring-1 focus:ring-primary text-gray-200"
          >
            <option value="default" className="bg-neutral-800">
              Last 365 days
            </option>
            {user.availableYears?.map((y) => (
              <option key={y} value={y} className="bg-neutral-800">
                {y}
              </option>
            ))}
          </select>
        </div>
        <ActivityGraph
          activity={user.activity}
          year={selectedYear}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        {selectedDate && (
          <>
            <h2 className="text-2xl font-bold mb-6">
              Activity for {selectedDate}
            </h2>
            <Activity userId={id} date={selectedDate} />
          </>
        )}
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6">Comments</h2>
        {currentUser && currentUser.id !== id && <CommentForm userId={id} />}
        <CommentList userId={id} />
      </div>
    </div>
  );
}
