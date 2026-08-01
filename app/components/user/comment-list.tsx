import { useState } from "react";
import { useComments } from "~/api/user";
import { Fallback } from "~/components/fallback";
import { UserCard } from "~/components/user-card";

export function CommentList({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const { data: commentsResult, isLoading: isCommentsLoading } = useComments(
    userId,
    page,
  );

  if (isCommentsLoading) {
    return (
      <div className="py-4">
        <Fallback />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {commentsResult?.items.length === 0 ? (
        <div className="text-gray-400 text-center py-8">No comments yet.</div>
      ) : (
        commentsResult?.items.map((comment) => (
          <div
            key={comment.id}
            className="bg-white/5 rounded-lg p-4 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <UserCard user={comment.author} size="sm" />
              <span className="text-xs text-gray-400">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-gray-200 whitespace-pre-wrap mt-2">
              {comment.content}
            </p>
          </div>
        ))
      )}

      {/* Pagination Controls */}
      {commentsResult && commentsResult.totalCount > 25 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-400">
            Page {page} of {Math.ceil(commentsResult.totalCount / 25)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(commentsResult.totalCount / 25)}
            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
