import { Select } from "@base-ui/react";
import { Suspense, startTransition } from "react";
import { CgChevronDown } from "react-icons/cg";
import { useParams, useSearchParams } from "react-router";
import {
  activityQueryOptions,
  commentsQueryOptions,
  useComments,
  useUser,
  useUserById,
  userByIdQueryOptions,
} from "~/api/user";
import { PageContainer } from "~/components/page-container";
import { Activity } from "~/components/user/activity";
import { ActivityGraph } from "~/components/user/activity-graph";
import { CommentForm } from "~/components/user/comment-form";
import { CommentList } from "~/components/user/comment-list";
import { Profile } from "~/components/user/profile";
import { getQueryClient } from "~/lib/query-client";
import { formatDate } from "~/lib/time";
import type { Route } from "./+types/user";

export async function clientLoader({
  request,
  params,
}: Route.ClientLoaderArgs) {
  const queryClient = getQueryClient();
  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  const yearStr = url.searchParams.get("year");
  const year = yearStr ? parseInt(yearStr, 10) : undefined;

  const [user] = await Promise.all([
    queryClient.ensureQueryData(userByIdQueryOptions(params.id!, year)),
    queryClient.prefetchQuery(commentsQueryOptions(params.id!, 1, 25)),
    ...(date
      ? [queryClient.ensureQueryData(activityQueryOptions(params.id!, date))]
      : []),
  ]);
  return { user };
}

export function meta({
  data,
}: Route.MetaArgs & { data?: Awaited<ReturnType<typeof clientLoader>> }) {
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
  const [searchParams, setSearchParams] = useSearchParams();
  const yearStr = searchParams.get("year");
  const selectedYear = yearStr ? parseInt(yearStr, 10) : undefined;
  const selectedDate = searchParams.get("date") || undefined;

  const setSelectedYear = (y: number | undefined) => {
    setSearchParams(
      (prev) => {
        if (y === undefined) prev.delete("year");
        else prev.set("year", y.toString());
        return prev;
      },
      { replace: true, preventScrollReset: true },
    );
  };

  const setSelectedDate = (d: string | undefined) => {
    setSearchParams(
      (prev) => {
        if (d === undefined) prev.delete("date");
        else prev.set("date", d);
        return prev;
      },
      { replace: true, preventScrollReset: true },
    );
  };

  const { data: user, isFetching } = useUserById(userId, selectedYear);
  const availableYears = user?.availableYears || initialAvailableYears;
  const activity = user?.activity ?? [];

  return (
    <>
      <div className="system-card flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Activity Graph</h2>
          {!!availableYears?.length && (
            <Select.Root
              value={selectedYear?.toString() ?? "default"}
              onValueChange={(value) => {
                const update = () => {
                  setSelectedYear(
                    value === "default"
                      ? undefined
                      : parseInt(value as string, 10),
                  );
                };
                if (document.startViewTransition) {
                  document.startViewTransition(() => {
                    startTransition(update);
                  });
                } else {
                  startTransition(update);
                }
              }}
            >
              <Select.Trigger className="flex justify-between items-center gap-2">
                <Select.Value>
                  {(value) => (value === "default" ? "Last 365 days" : value)}
                </Select.Value>
                <Select.Icon>
                  <CgChevronDown className="text-gray-500 dark:text-gray-400" />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Positioner
                  side="bottom"
                  align="start"
                  alignItemWithTrigger={false}
                  sideOffset={4}
                  className="z-50"
                >
                  <Select.Popup className="system-popup min-w-(--anchor-width">
                    <Select.Item value="default" className="system-popup-item">
                      <Select.ItemText>Last 365 days</Select.ItemText>
                    </Select.Item>
                    {availableYears?.map((y) => (
                      <Select.Item
                        key={y}
                        value={y.toString()}
                        className="system-popup-item"
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
          <div className="w-full flex justify-center py-4">
            <div className="system-skeleton w-full h-40" />
          </div>
        ) : (
          <Suspense
            fallback={<div className="system-skeleton w-full h-40 mt-4" />}
          >
            <ActivityGraph
              activity={activity}
              year={selectedYear}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </Suspense>
        )}
      </div>
      {selectedDate && (
        <div
          key={selectedDate}
          className="system-card transition duration-300 starting:opacity-0 starting:translate-y-1 flex flex-col gap-6"
        >
          <h2 className="text-2xl font-bold">
            Activity for {formatDate(selectedDate, false)}
          </h2>
          <Activity userId={userId} date={selectedDate} />
        </div>
      )}
    </>
  );
}

export function HydrateFallback() {
  return (
    <PageContainer className="max-w-5xl">
      {/* Profile Skeleton */}
      <div className="flex items-center gap-6 bg-muted border border-muted-border p-6 rounded-xl relative">
        <div className="relative group/avatar inline-flex shrink-0">
          <div className="system-skeleton w-32 h-32 rounded-full" />
        </div>
        <div className="flex flex-col flex-1 gap-4">
          <div className="system-skeleton w-64 h-10 rounded-lg" />
          <div className="system-skeleton w-32 h-6 rounded-lg" />
        </div>
      </div>

      {/* Activity Section Skeleton */}
      <div className="system-card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Activity</h2>
          <Select.Root disabled>
            <Select.Trigger className="flex justify-between items-center gap-2 system-input opacity-50 cursor-not-allowed">
              <Select.Value>Last 365 days</Select.Value>
              <Select.Icon>
                <CgChevronDown className="text-gray-500 dark:text-gray-400" />
              </Select.Icon>
            </Select.Trigger>
          </Select.Root>
        </div>
        <div className="w-full flex justify-center py-4">
          <div className="system-skeleton w-full h-40" />
        </div>
      </div>

      {/* Comments Skeleton */}
      <div className="system-card flex flex-col gap-6">
        <h2 className="text-2xl font-bold">Comments</h2>
        <div className="flex flex-col gap-4">
          <div className="system-skeleton w-full h-24 rounded-lg" />
          <div className="system-skeleton w-full h-24 rounded-lg" />
          <div className="system-skeleton w-full h-24 rounded-lg" />
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
        <div className="system-card flex flex-col gap-6">
          <h2 className="text-2xl font-bold">Comments</h2>
          {canComment && <CommentForm userId={id} />}
          <CommentList userId={id} />
        </div>
      )}
    </PageContainer>
  );
}
