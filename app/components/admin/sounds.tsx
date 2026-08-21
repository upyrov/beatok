import { useCallback } from "react";
import {
  useCreateSound,
  useDeleteSound,
  useSounds,
  useUploadSoundUrl,
} from "~/api/sound";
import { validateAudioFile } from "~/lib/audio";
import { toastError } from "~/lib/toast";
import { uploadFile } from "~/lib/upload";
import { FileDropzone } from "../file-dropzone";
import { Sound } from "./sound";

export function Sounds({ categoryId }: { categoryId: string }) {
  const soundsQuery = useSounds(categoryId);
  const sounds = soundsQuery.data ?? [];
  const deleteMutation = useDeleteSound();
  const createMutation = useCreateSound();
  const getUploadUrlMutation = useUploadSoundUrl();

  const handleUpload = useCallback(
    async (file: File, onProgress: (progress: number) => void) => {
      const validation = await validateAudioFile(file);
      if (!validation.valid || validation.durationSeconds === 0) {
        const errorMsg = validation.error || "Failed to read audio file metadata.";
        toastError(errorMsg);
        throw new Error(errorMsg);
      }

      const fileExtension = file.name.split(".").pop() ?? "";
      const { uploadUrl, fileKey } = await getUploadUrlMutation.mutateAsync({
        extension: fileExtension,
        contentType: file.type,
      });

      await uploadFile(file, uploadUrl, onProgress);
      await createMutation.mutateAsync({
        name: file.name.replace(/\.[^/.]+$/, ""),
        value: fileKey,
        categoryId,
      });
    },
    [],
  );

  return (
    <div className="flex flex-col gap-4 flex-1">
      <div className="flex flex-col gap-3">
        <label>Upload New Sound</label>
        <div className="flex flex-col gap-2">
          <FileDropzone
            label="Click or drag sounds here (multiple allowed)"
            maxFiles={100}
            onUpload={handleUpload}
          />
        </div>
      </div>

      <div className="flex-1 space-y-4 mt-2">
        <>
          {sounds.map((sound) => (
            <Sound
              key={sound.id}
              sound={sound}
              onDelete={() => {
                if (confirm("Are you sure you want to delete this sound?")) {
                  deleteMutation.mutate(sound.id);
                }
              }}
            />
          ))}
          {!sounds.length && <p>No sounds found</p>}
        </>
      </div>
    </div>
  );
}
