import { useMutation } from "@tanstack/react-query";
import { CrudApi, fetchApi } from ".";
import { queryKeys } from "./query-keys";
import type {
  CreateSound,
  Sound,
  SoundUpdate,
  SoundUpload,
} from "./types/sound";

export class SoundApi extends CrudApi<
  [Sound, string],
  CreateSound,
  SoundUpdate
> {
  useUploadUrl = () => {
    return useMutation({
      mutationFn: async ({
        extension,
        contentType,
      }: {
        extension: string;
        contentType: string;
      }): Promise<SoundUpload> => {
        const params = new URLSearchParams({ extension, contentType });
        return fetchApi<SoundUpload>(`/sounds/upload?${params.toString()}`);
      },
    });
  };
}

export const {
  useList: useSounds,
  useCreate: useCreateSound,
  useUpdate: useUpdateSound,
  useDelete: useDeleteSound,
  useUploadUrl: useUploadSoundUrl,
} = new SoundApi(
  "/sounds",
  queryKeys.sounds,
  (categoryId: string) =>
    `/sounds?${new URLSearchParams({ id: categoryId }).toString()}`,
);
