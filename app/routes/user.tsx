import { Select } from "@base-ui/react";
import { Suspense, useState } from "react";
import { useParams } from "react-router";
import {
  commentsQueryOptions,
  useComments,
  useUser,
  useUserById,
  userByIdQueryOptions,
} from "~/api/user";
import { Card } from "~/components/card";
import { PageContainer } from "~/components/page-container";
import { Skeleton } from "~/components/skeleton";
import { Activity } from "~/components/user/activity";
import { ActivityGraph } from "~/components/user/activity-graph";
import { CommentForm } from "~/components/user/comment-form";
import { CommentList } from "~/components/user/comment-list";
import { Profile } from "~/components/user/profile";
import { getQueryClient } from "~/lib/query-client";
import type { Route } from "./+types/user";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const queryClient = getQueryClient();
  const [user] = await Promise.all([
    queryClient.ensureQueryData(userByIdQueryOptions(params.id!)),
    queryClient.prefetchQuery(commentsQueryOptions(params.id!, 1, 25)),
  ]);
  return { user };
}

export function meta({ data }: Route.MetaArgs & { data: any }) {
  const title = data?.user?.name
    ? `Beatok | ${data.user.name}`
    : "Beatok | User Profile";
  const description = `View ${
    data?.user?.name || "this user"
  }'s beat battle profile, stats, and activity on Beatok.`;
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
  ];
}

function ActivitySection({
  userId,
  initialAvailableYears,
}: {
  userId: string;
  initialAvailableYears?: number[];
}) {
  const [selectedYear, setSelectedYear] = useState<number | undefined>();
  const [selectedDate, setSelectedDate] = useState<string | undefined>();

  const { data: user, isFetching } = useUserById(userId, selectedYear);
  const availableYears = user?.availableYears || initialAvailableYears;
  const activity = user?.activity || [];

  return (
    <>
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Activity Graph</h2>
          {!!availableYears?.length && (
            <Select.Root
              value={selectedYear?.toString() ?? "default"}
              onValueChange={(value) => {
                setSelectedYear(
                  value === "default"
                    ? undefined
                    : parseInt(value as string, 10),
                );
              }}
            >
              <Select.Trigger className="sys-input cursor-pointer flex justify-between items-center gap-2">
                <Select.Value>
                  {(value) => (value === "default" ? "Last 365 days" : value)}
                </Select.Value>
                <Select.Icon />
              </Select.Trigger>
              <Select.Portal>
                <Select.Positioner
                  side="bottom"
                  align="start"
                  alignItemWithTrigger={false}
                  sideOffset={4}
                >
                  <Select.Popup className="sys-popup min-w-(--anchor-width">
                    <Select.Item value="default" className="sys-popup-item">
                      <Select.ItemText>Last 365 days</Select.ItemText>
                    </Select.Item>
                    {availableYears?.map((y) => (
                      <Select.Item
                        key={y}
                        value={y.toString()}
                        className="sys-popup-item"
                      >
                        <Select.ItemText>{y}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Popup>
                </Select.Positioner>
              </Select.Portal>
            </Select.Root>
          )}
        </div>
        {isFetching ? (
          <div className="w-full flex justify-center py-8">
            <Skeleton className="w-full h-64" />
          </div>
        ) : (
          <Suspense fallback={<Skeleton className="w-full h-64 mt-4" />}>
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

export function HydrateFallback() {
  return (
    <PageContainer className="max-w-5xl">
      {/* Profile Skeleton */}
      <div className="flex items-center gap-6 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-6 rounded-xl relative">
        <div className="relative group/avatar inline-flex shrink-0">
          <Skeleton className="w-32 h-32 rounded-lg" />
        </div>
        <div className="flex flex-col flex-1 gap-4">
          <Skeleton className="w-64 h-10 rounded-lg" />
          <Skeleton className="w-32 h-6 rounded-lg" />
        </div>
      </div>

      {/* Activity Section Skeleton */}
      <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="w-48 h-8 rounded-lg" />
          <Skeleton className="w-32 h-10 rounded-lg" />
        </div>
        <Skeleton className="w-full h-64 mt-4" />
      </div>

      {/* Comments Skeleton */}
      <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-6">
        <Skeleton className="w-40 h-8 rounded-lg mb-4" />
        <div className="flex flex-col gap-4 mt-6">
          <Skeleton className="w-full h-24 rounded-lg" />
          <Skeleton className="w-full h-24 rounded-lg" />
          <Skeleton className="w-full h-24 rounded-lg" />
        </div>
      </div>
    </PageContainer>
  );
}

export default function User() {
  const { id } = useParams<{ id: string }>();
  const { data: currentUser } = useUser();

  const { data: user, isLoading: isUserLoading } = useUserById(id!);
  const { data: commentsResult } = useComments(id!, 1);

  if (!id || !user) {
    if (isUserLoading) return <HydrateFallback />;
    return <div className="p-8 text-center text-red-500">User not found</div>;
  }

  const hasComments = (commentsResult?.items?.length ?? 0) > 0;
  const canComment = !!currentUser && currentUser.id !== id;
  const showComments = hasComments || canComment;

  return (
    <PageContainer className="max-w-5xl">
      <Profile user={user} isCurrentUser={currentUser?.id === user.id} />
      <ActivitySection
        userId={id}
        initialAvailableYears={user.availableYears}
      />
      {showComments && (
        <Card>
          <h2 className="text-2xl font-bold">Comments</h2>
          {canComment && <CommentForm userId={id} />}
          <CommentList userId={id} />
        </Card>
      )}
    </PageContainer>
  );
}
