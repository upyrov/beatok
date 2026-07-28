import {
  useSounds,
  useCreateSound,
  useDeleteSound,
  useUploadSoundUrl,
} from "~/api/sounds";
import { QueryBoundary } from "./error/query-boundary";
import { validateAudioFile } from "~/lib/audio";
import { uploadFile } from "~/lib/upload";
import { FileDropzone } from "./file-dropzone";

export function Sounds({ categoryId }: { categoryId: string }) {
  const soundsQuery = useSounds(categoryId);
  const deleteMutation = useDeleteSound();
  const createMutation = useCreateSound();
  const getUploadUrlMutation = useUploadSoundUrl();

  async function handleUpload(
    file: File,
    onProgress: (progress: number) => void,
  ) {
    const validation = await validateAudioFile(file);
    if (!validation.valid) throw new Error(validation.error);

    const fileExtension = file.name.split(".").pop() || "";
    const { uploadUrl, fileKey } = await getUploadUrlMutation.mutateAsync({
      extension: fileExtension,
      contentType: file.type,
    });

    await uploadFile(file, uploadUrl, onProgress);

    await createMutation.mutateAsync({
      value: fileKey,
      categoryId,
    });
  }

  return (
    <div className="flex flex-col gap-4 flex-1">
      <div className="flex flex-col gap-3 bg-black/20 border border-white/10 p-4 rounded-lg">
        <label className="text-sm font-semibold text-white/80">
          Upload New Sound
        </label>
        <div className="flex flex-col gap-2">
          <FileDropzone
            label="Click or drag sounds here (multiple allowed)"
            maxFiles={100}
            onUpload={handleUpload}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-2 mt-2">
        <QueryBoundary query={soundsQuery}>
          {(sounds) => (
            <>
              {sounds.map((sound) => (
                <div
                  key={sound.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                >
                  <span
                    className="truncate flex-1 text-sm font-medium mr-2"
                    title={sound.value}
                  >
                    {sound.value}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        confirm("Are you sure you want to delete this sound?")
                      )
                        deleteMutation.mutate(sound.id);
                    }}
                    className="text-red-400 hover:bg-red-400/20 px-2 py-1 rounded text-xs shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {sounds.length === 0 && (
                <p className="text-white/50 text-sm text-center mt-6">
                  No sounds found
                </p>
              )}
            </>
          )}
        </QueryBoundary>
      </div>
    </div>
  );
}
