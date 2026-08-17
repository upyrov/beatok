import { Button } from "~/components/ui/button";
import { useState } from "react";
import { useComments } from "~/api/user";
import { UserCard } from "~/components/user-card";

export function CommentList({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const { data: commentsResult, isLoading: isCommentsLoading } = useComments(
    userId,
    page,
  );

  if (isCommentsLoading) {
    return (
      <div className="flex flex-col gap-4 py-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="system-skeleton h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {!commentsResult?.items.length ? (
        <div className="text-gray-400 text-center py-8">No comments yet.</div>
      ) : (
        commentsResult?.items.map((comment) => (
          <div
            key={comment.id}
            className="transition duration-300 starting:opacity-0 starting:translate-y-1 bg-muted rounded-lg p-4 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <UserCard user={comment.author} />
              <span className="text-xs text-gray-400">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap mt-2">
              {comment.content}
            </p>
          </div>
        ))
      )}

      {commentsResult && commentsResult.totalCount > 25 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-muted-border">
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-black/10 dark:bg-white/10 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            Previous
          </Button>
          <span className="text-sm text-gray-400">
            Page {page} of {Math.ceil(commentsResult.totalCount / 25)}
          </span>
          <Button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(commentsResult.totalCount / 25)}
            className="px-4 py-2 bg-black/10 dark:bg-white/10 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
