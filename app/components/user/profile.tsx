import { Form as BaseForm, Input as BaseInput, Button } from "@base-ui/react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { type } from "arktype";
import { useCallback, useState } from "react";
import {
  CgChart,
  CgSoftwareUpload,
  CgSpinner,
  CgTrash,
  CgTrending,
  CgTrophy,
  CgUser,
} from "react-icons/cg";
import { queryKeys } from "~/api/query-keys";
import type { Profile as IProfile } from "~/api/types/user";
import { useUpdateUser, useUploadAvatarUrl } from "~/api/user";
import { FileDropzone } from "~/components/file-dropzone";
import { toastError } from "~/lib/toast";
import { uploadFile } from "~/lib/upload";
import { ActionButton } from "../action-button";

interface ProfileProps {
  user: IProfile;
  isCurrentUser: boolean;
}

export function Profile({ user, isCurrentUser }: ProfileProps) {
  const getUploadUrlMutation = useUploadAvatarUrl();
  const updateUserMutation = useUpdateUser();
  const queryClient = useQueryClient();
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleAvatarUpload = useCallback(
    async (file: File, onProgress: (progress: number) => void) => {
      const fileExtension = file.name.split(".").pop() || "";
      const { uploadUrl, fileKey } = await getUploadUrlMutation.mutateAsync({
        extension: fileExtension,
        contentType: file.type,
      });

      await uploadFile(file, uploadUrl, onProgress);
      await updateUserMutation.mutateAsync({ picture: fileKey });

      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(user.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
    },
    [getUploadUrlMutation, updateUserMutation, queryClient, user.id],
  );

  const handleRemoveAvatar = useCallback(async () => {
    await updateUserMutation.mutateAsync({ picture: null });
    queryClient.invalidateQueries({
      queryKey: queryKeys.users.detail(user.id),
    });
    queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
  }, [updateUserMutation, queryClient, user.id]);

  const form = useForm({
    defaultValues: {
      name: user.name || "",
    },
    onSubmit: async ({ value }) => {
      if (updateUserMutation.isPending) return;
      try {
        await updateUserMutation.mutateAsync({
          name: value.name,
          picture: user.picture,
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.users.detail(user.id),
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
      } catch (error) {
        toastError(error);
      }
    },
  });

  const dropzoneOverlay = isCurrentUser ? (
    <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center z-10 rounded-full overflow-hidden [&>div]:w-full [&>div]:h-full [&>div>div]:w-full [&>div>div]:h-full [&>div>div]:p-0 [&>div>div]:border-none [&>div>div]:bg-transparent [&>div>div]:rounded-none [&>div>p]:mb-0 [&>div>p]:flex [&>div>p]:items-center [&>div>p]:justify-center [&>div>p]:h-full">
      <FileDropzone
        label={<CgSoftwareUpload size={32} className="text-white/80" />}
        accept={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] }}
        maxFiles={1}
        onUpload={handleAvatarUpload}
      />
    </div>
  ) : null;

  const [formParent] = useAutoAnimate();

  return (
    <div className="system-card flex flex-col sm:flex-row items-center sm:items-start gap-6 relative">
      <div className="flex flex-col items-center gap-2">
        <div className="relative group/avatar inline-flex shrink-0 w-24 h-24 sm:w-32 sm:h-32">
          {user.picture ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="system-skeleton absolute inset-0 rounded-full w-full h-full" />
                  <CgSpinner
                    role="status"
                    aria-label={"Loading..."}
                    className="animate-spin text-gray-500 w-8 h-8 relative"
                  />
                </div>
              )}
              <img
                src={user.picture}
                alt={user.name ?? "Anonymous"}
                onLoad={() => setImageLoaded(true)}
                className={`object-cover ring-1 ring-black/5 dark:ring-white/10 w-full h-full rounded-full ${imageLoaded ? "" : "invisible"}`}
              />
            </>
          ) : (
            <div className="w-full h-full rounded-full bg-muted flex items-center justify-center shrink-0 ring-1 ring-black/5 dark:ring-white/10">
              <CgUser className="text-gray-400 text-6xl group-hover:transition-colors" />
            </div>
          )}
          {dropzoneOverlay}
          {isCurrentUser && user.picture && (
            <Button
              type="button"
              onClick={handleRemoveAvatar}
              disabled={updateUserMutation.isPending}
              className="absolute -top-2 -right-2 z-20 bg-black/80 hover:bg-red-500 text-white p-1.5 rounded-full shadow-md transition-colors disabled:opacity-50"
              title="Remove profile picture"
            >
              <CgTrash size={16} />
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col flex-1 gap-2 items-center sm:items-start text-center sm:text-left w-full">
        {isCurrentUser ? (
          <form
            ref={formParent}
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="flex flex-col sm:flex-row items-center gap-2 w-full max-w-sm"
          >
            <form.Field
              name="name"
              validators={{ onChange: type("string > 0") }}
              children={(field) => (
                <BaseInput
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Your Name"
                  className="flex-1 system-input text-xl font-semibold w-full"
                />
              )}
            />
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting, state.isDirty]}
              children={([canSubmit, isSubmitting, isDirty]) => (
                isDirty && (
                  <ActionButton
                    type="submit"
                    disabled={!canSubmit || isSubmitting || updateUserMutation.isPending}
                  >
                    Save
                  </ActionButton>
                )
              )}
            />
          </form>
        ) : (
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-200">
            {user.name || "Anonymous"}
          </h1>
        )}
        <div className="flex items-center justify-center sm:justify-start gap-4 sm:gap-6 mt-2 text-sm text-muted-foreground w-full px-2">
          <div className="flex flex-col items-center">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <CgChart /> Rating
            </span>
            <span className="mt-1">{user.rating}</span>
          </div>
          <div className="w-px h-8 bg-black/10 dark:bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <CgTrophy /> Wins
            </span>
            <span className="mt-1">{user.wins}</span>
          </div>
          <div className="w-px h-8 bg-black/10 dark:bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <CgTrending /> Win Rate
            </span>
            <span className="mt-1">{Math.round(user.winRate)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
