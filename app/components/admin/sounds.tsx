import { useState } from "react";
import { CgClose, CgPen, CgTrash } from "react-icons/cg";
import {
  useCreateSound,
  useDeleteSound,
  useSounds,
  useUpdateSoundValue,
  useUploadSoundUrl,
} from "~/api/sound";
import type { Sound } from "~/api/types/sound/sound";
import { validateAudioFile } from "~/lib/audio";
import { uploadFile } from "~/lib/upload";
import { AudioPlayer } from "../audio-player";
import { FileDropzone } from "../file-dropzone";
import { QueryBoundary } from "../query-boundary";

function SoundItem({
  sound,
  onDelete,
}: {
  sound: Sound;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const updateMutation = useUpdateSoundValue();
  const getUploadUrlMutation = useUploadSoundUrl();

  async function handleUpdate(
    file: File,
    onProgress: (progress: number) => void,
  ) {
    try {
      const validation = await validateAudioFile(file);
      if (!validation.valid) throw new Error(validation.error);

      const fileExtension = file.name.split(".").pop() || "";
      const { uploadUrl, fileKey } = await getUploadUrlMutation.mutateAsync({
        extension: fileExtension,
        contentType: file.type,
      });

      await uploadFile(file, uploadUrl, onProgress);

      updateMutation.mutate(
        { id: sound.id, data: { value: fileKey } },
        { onSuccess: () => setIsEditing(false) },
      );
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Upload failed");
    }
  }

  return (
    <div className="flex flex-col gap-2 p-2 border-b border-gray-200">
      <div className="flex items-center justify-between mb-1">
        {isEditing ? (
          <div className="flex flex-col gap-2 flex-1 mr-4">
            <FileDropzone
              label="Drop new sound file here to replace"
              maxFiles={1}
              onUpload={handleUpdate}
            />
            <button
              onClick={() => setIsEditing(false)}
              className="text-red-400 hover:text-red-300 self-start text-sm flex items-center gap-1"
            >
              <CgClose /> Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <span className="text-sm truncate max-w-50" title={sound.value}>
              {sound.value}
            </span>
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-500 hover:text-gray-900"
            >
              <CgPen />
            </button>
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-gray-500 hover:text-gray-900"
        >
          <CgTrash />
        </button>
      </div>
      <AudioPlayer src={sound.value} />
    </div>
  );
}

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
        <QueryBoundary query={soundsQuery}>
          {(sounds) => (
            <>
              {sounds.map((sound) => (
                <SoundItem
                  key={sound.id}
                  sound={sound}
                  onDelete={() => {
                    if (
                      confirm("Are you sure you want to delete this sound?")
                    ) {
                      deleteMutation.mutate(sound.id);
                    }
                  }}
                />
              ))}
              {sounds.length === 0 && <p>No sounds found</p>}
            </>
          )}
        </QueryBoundary>
      </div>
    </div>
  );
}
