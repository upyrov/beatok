import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { type } from "arktype";
import { useState } from "react";
import { CgProfile } from "react-icons/cg";
import { useParams } from "react-router";
import { queryKeys } from "~/api/query-keys";
import {
  commentsQueryOptions,
  useAddComment,
  useComments,
  useUpdateUser,
  useUploadAvatarUrl,
  useUser,
  useUserById,
  userByIdQueryOptions,
} from "~/api/users";
import { FileDropzone } from "~/components/file-dropzone";
import { LoadingFallback } from "~/components/loading/loading-fallback";
import { UserCard } from "~/components/user-card";
import { getQueryClient } from "~/lib/query-client";
import { uploadFile } from "~/lib/upload";
import type { Route } from "./+types/user";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const queryClient = getQueryClient();
  const id = params.id as string;
  await Promise.all([
    queryClient.prefetchQuery(userByIdQueryOptions(id)),
    queryClient.prefetchQuery(commentsQueryOptions(id, 1, 25)),
  ]);
}

export default function User() {
  const { id } = useParams<{ id: string }>();
  const { data: currentUser } = useUser();
  const [page, setPage] = useState(1);

  const { data: user, isLoading: isUserLoading } = useUserById(id!);
  const { data: commentsResult, isLoading: isCommentsLoading } = useComments(
    id!,
    page,
  );
  const addComment = useAddComment(id!);
  const getUploadUrlMutation = useUploadAvatarUrl();
  const updateUserMutation = useUpdateUser();
  const queryClient = useQueryClient();

  async function handleAvatarUpload(
    file: File,
    onProgress: (progress: number) => void,
  ) {
    const fileExtension = file.name.split(".").pop() || "";
    const { uploadUrl, fileKey } = await getUploadUrlMutation.mutateAsync({
      extension: fileExtension,
      contentType: file.type,
    });

    await uploadFile(file, uploadUrl, onProgress);
    await updateUserMutation.mutateAsync({ picture: fileKey });

    // Invalidate queries to refresh the user profile picture
    queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id!) });
    queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
  }

  const nameForm = useForm({
    defaultValues: {
      name: user?.name || "",
    },
    onSubmit: async ({ value }) => {
      try {
        await updateUserMutation.mutateAsync({ name: value.name });
        queryClient.invalidateQueries({
          queryKey: queryKeys.users.detail(id!),
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
      } catch (e) {
        console.error(e);
      }
    },
  });

  const form = useForm({
    defaultValues: {
      content: "",
    },
    onSubmit: async ({ value }) => {
      try {
        await addComment.mutateAsync({ userId: id!, data: value });
        form.reset();
      } catch (e) {
        console.error(e);
      }
    },
  });

  if (isUserLoading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <div className="p-8 text-center text-red-500">User not found</div>;
  }

  const dropzoneOverlay =
    currentUser?.id === user.id ? (
      <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center z-10 rounded-lg overflow-hidden [&>div>div]:p-2 [&>div>div]:border-none [&>div>div]:bg-transparent [&>div>p]:text-xs">
        <FileDropzone
          label="Update"
          accept={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] }}
          maxFiles={1}
          onUpload={handleAvatarUpload}
        />
      </div>
    ) : null;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 flex flex-col gap-8">
      {/* Profile Header */}
      <div className="flex items-center gap-6 bg-white/5 border border-white/10 p-6 rounded-xl relative">
        <div className="relative group/avatar inline-flex shrink-0">
          {user.picture ? (
            <img
              src={user.picture}
              alt={user.name}
              className="object-cover border border-white/20 p-0.5 w-32 h-32 rounded-lg"
            />
          ) : (
            <CgProfile className="text-gray-400 border border-white/20 p-0.5 w-32 h-32 rounded-lg" />
          )}
          {dropzoneOverlay}
        </div>

        <div className="flex flex-col flex-1 gap-2">
          {currentUser?.id === user.id ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                nameForm.handleSubmit();
              }}
              className="flex items-center gap-2 max-w-sm"
            >
              <nameForm.Field
                name="name"
                validators={{ onChange: type("string > 0") }}
                children={(field) => (
                  <input
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Your Name"
                    className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                )}
              />
              <nameForm.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <button
                    type="submit"
                    disabled={
                      !canSubmit || isSubmitting || updateUserMutation.isPending
                    }
                    className="bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    Save
                  </button>
                )}
              />
            </form>
          ) : (
            <h1 className="text-3xl font-bold text-gray-200">{user.name}</h1>
          )}
          <span className="text-gray-400">Rating: {user.rating}</span>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6">Comments</h2>

        {/* Comment Form */}
        {currentUser && currentUser.id !== id && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="mb-8 flex flex-col gap-2"
          >
            <form.Field
              name="content"
              validators={{
                onChange: type("string > 0"),
              }}
              children={(field) => (
                <textarea
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Leave a comment..."
                  className="w-full bg-white/10 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-25"
                />
              )}
            />
            <div className="flex justify-end">
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <button
                    type="submit"
                    disabled={
                      !canSubmit || isSubmitting || addComment.isPending
                    }
                    className="bg-primary hover:bg-primary/90 px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    Post Comment
                  </button>
                )}
              />
            </div>
          </form>
        )}

        {/* Comments List */}
        {isCommentsLoading ? (
          <div className="py-4">
            <LoadingFallback />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {commentsResult?.items.length === 0 ? (
              <div className="text-gray-400 text-center py-8">
                No comments yet.
              </div>
            ) : (
              commentsResult?.items.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-white/5 rounded-lg p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <UserCard user={comment.author} size="sm" disableLink />
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
        )}
      </div>
    </div>
  );
}
