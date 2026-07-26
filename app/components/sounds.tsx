import { useState, useRef } from "react";
import {
  useSounds,
  useCreateSound,
  useDeleteSound,
  useUploadSoundUrl,
} from "~/api/sounds";
import { QueryBoundary } from "./error/query-boundary";
import { MUSIC_FILE_ACCEPT, validateAudioFile } from "~/lib/audio";
import { LoadingButton } from "./loading";

export function Sounds({ categoryId }: { categoryId: string }) {
  const soundsQuery = useSounds(categoryId);
  const deleteMutation = useDeleteSound();
  const createMutation = useCreateSound();
  const getUploadUrlMutation = useUploadSoundUrl();

  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload() {
    if (!fileToUpload) return;
    const validation = await validateAudioFile(fileToUpload);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }
    try {
      const fileExtension = fileToUpload.name.split(".").pop() || "";
      const uploadData = await getUploadUrlMutation.mutateAsync({
        extension: fileExtension,
        contentType: fileToUpload.type,
      });

      const uploadResponse = await fetch(uploadData.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": fileToUpload.type },
        body: fileToUpload,
      });

      if (!uploadResponse.ok) throw new Error("Failed to upload file");

      await createMutation.mutateAsync({
        value: uploadData.fileKey,
        categoryId: categoryId,
      });

      setFileToUpload(null);
      // Reset input file value to allow uploading the same file again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (e) {
      console.error(e);
      alert("Failed to upload sound");
    }
  }

  return (
    <div className="flex flex-col gap-4 flex-1">
      <div className="flex flex-col gap-3 bg-black/20 border border-white/10 p-4 rounded-lg">
        <label className="text-sm font-semibold text-white/80">
          Upload New Sound
        </label>
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            id="sound-upload-input"
            type="file"
            accept={MUSIC_FILE_ACCEPT}
            onChange={async (e) => {
              const file = e.target.files?.[0] || null;
              if (!file) {
                setFileToUpload(null);
                return;
              }
              const validation = await validateAudioFile(file);
              if (!validation.valid) {
                alert(validation.error);
                if (fileInputRef.current) fileInputRef.current.value = "";
                setFileToUpload(null);
                return;
              }
              setFileToUpload(file);
            }}
            className="flex-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 transition-colors"
          />
          <LoadingButton
            onClick={handleFileUpload}
            disabled={!fileToUpload}
            isPending={
              getUploadUrlMutation.isPending || createMutation.isPending
            }
            pendingText="Uploading..."
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto"
          >
            Upload Sound
          </LoadingButton>
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
                    style={{ opacity: 1 }}
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
