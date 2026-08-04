import { Suspense, useState } from "react";
import { useParams } from "react-router";
import {
  commentsQueryOptions,
  useUser,
  useUserById,
  userByIdQueryOptions,
} from "~/api/user";
import { Card } from "~/components/card";
import { Fallback } from "~/components/fallback";
import { PageContainer } from "~/components/page-container";
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

function ActivitySection({ userId, initialAvailableYears }: { userId: string, initialAvailableYears?: number[] }) {
  const [selectedYear, setSelectedYear] = useState<number | undefined>();
  const [selectedDate, setSelectedDate] = useState<string | undefined>();

  const { data: user, isFetching } = useUserById(userId, selectedYear);
  const availableYears = user?.availableYears || initialAvailableYears;
  const activity = user?.activity || [];

  return (
    <>
      <Card>
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
            {availableYears?.map((y) => (
              <option key={y} value={y} className="bg-neutral-800">
                {y}
              </option>
            ))}
          </select>
        </div>
        {isFetching ? (
          <div className="w-full flex justify-center p-8">
            <Fallback />
          </div>
        ) : (
          <Suspense fallback={<Fallback />}>
            <ActivityGraph
              activity={activity}
              year={selectedYear}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </Suspense>
        )}
      </Card>
      {selectedDate && (
        <Card>
          <h2 className="text-2xl font-bold mb-6">
            Activity for {selectedDate}
          </h2>
          <Activity userId={userId} date={selectedDate} />
        </Card>
      )}
    </>
  );
}

export default function User() {
  const { id } = useParams<{ id: string }>();
  const { data: currentUser } = useUser();

  const { data: user, isLoading: isUserLoading } = useUserById(id!);

  if (isUserLoading) {
    return <Fallback />;
  }

  if (!id || !user) {
    return <div className="p-8 text-center text-red-500">User not found</div>;
  }

  return (
    <PageContainer className="max-w-5xl">
      <Profile user={user} isCurrentUser={currentUser?.id === user.id} />
      <ActivitySection userId={id} initialAvailableYears={user.availableYears} />
      <Card>
        <h2 className="text-2xl font-bold mb-6">Comments</h2>
        {currentUser && currentUser.id !== id && <CommentForm userId={id} />}
        <CommentList userId={id} />
      </Card>
    </PageContainer>
  );
}
