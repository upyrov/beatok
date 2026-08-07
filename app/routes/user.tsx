import { Select } from "@base-ui/react";
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
    queryClient.ensureQueryData(userByIdQueryOptions(params.id)),
    queryClient.ensureQueryData(commentsQueryOptions(params.id, 1, 25)),
  ]);
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
    return <Fallback fullScreen />;
  }

  if (!id || !user) {
    return <div className="p-8 text-center text-red-500">User not found</div>;
  }

  return (
    <PageContainer className="max-w-5xl">
      <Profile user={user} isCurrentUser={currentUser?.id === user.id} />
      <ActivitySection
        userId={id}
        initialAvailableYears={user.availableYears}
      />
      <Card>
        <h2 className="text-2xl font-bold">Comments</h2>
        {currentUser && currentUser.id !== id && <CommentForm userId={id} />}
        <CommentList userId={id} />
      </Card>
    </PageContainer>
  );
}
