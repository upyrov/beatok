import { useParams } from "react-router";
import {
  commentsQueryOptions,
  historyQueryOptions,
  useUser,
  useUserById,
  userByIdQueryOptions,
} from "~/api/user";
import { Fallback } from "~/components/fallback";
import { CommentForm } from "~/components/user/comment-form";
import { CommentList } from "~/components/user/comment-list";
import { History } from "~/components/user/history";
import { Profile } from "~/components/user/profile";
import { getQueryClient } from "~/lib/query-client";
import type { Route } from "./+types/user";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const queryClient = getQueryClient();
  const id = params.id as string;
  await Promise.all([
    queryClient.prefetchQuery(userByIdQueryOptions(id)),
    queryClient.prefetchQuery(commentsQueryOptions(id, 1, 25)),
    queryClient.prefetchQuery(historyQueryOptions(id, 1, 25)),
  ]);
}

export default function User() {
  const { id } = useParams<{ id: string }>();
  const { data: currentUser } = useUser();
  const { data: user, isLoading: isUserLoading } = useUserById(id!);

  if (isUserLoading) {
    return <Fallback />;
  }

  if (!user) {
    return <div className="p-8 text-center text-red-500">User not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 flex flex-col gap-8">
      <Profile user={user} isCurrentUser={currentUser?.id === user.id} />
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6">History</h2>
        <History userId={id!} />
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6">Comments</h2>
        {currentUser && currentUser.id !== id && <CommentForm userId={id!} />}
        <CommentList userId={id!} />
      </div>
    </div>
  );
}
