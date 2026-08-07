import { Form as BaseForm, Input as BaseInput } from "@base-ui/react";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { type } from "arktype";
import { useCallback } from "react";
import { CgProfile } from "react-icons/cg";
import { queryKeys } from "~/api/query-keys";
import type { Profile as IProfile } from "~/api/types/user/profile";
import { useUpdateUser, useUploadAvatarUrl } from "~/api/user";
import { FileDropzone } from "~/components/file-dropzone";
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

  const form = useForm({
    defaultValues: {
      name: user.name || "",
    },
    onSubmit: async ({ value }) => {
      try {
        await updateUserMutation.mutateAsync({ name: value.name });
        queryClient.invalidateQueries({
          queryKey: queryKeys.users.detail(user.id),
        });
        queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
      } catch (error) {
        console.error(error);
      }
    },
  });

  const dropzoneOverlay = isCurrentUser ? (
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
        {isCurrentUser ? (
          <BaseForm
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="flex items-center gap-2 max-w-sm"
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
                  className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}
            />
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <ActionButton
                  disabled={
                    !canSubmit || isSubmitting || updateUserMutation.isPending
                  }
                >
                  Save
                </ActionButton>
              )}
            />
          </BaseForm>
        ) : (
          <h1 className="text-3xl font-bold text-gray-200">{user.name}</h1>
        )}
        <div className="flex items-center gap-4 text-gray-400">
          <span>Rating: {user.rating}</span>
        </div>
      </div>
    </div>
  );
}
