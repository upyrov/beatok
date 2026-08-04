import { useState } from "react";
import { CgClose, CgPen, CgTrash } from "react-icons/cg";
import { useUpdateSoundValue, useUploadSoundUrl } from "~/api/sound";
import type { Sound } from "~/api/types/sound/sound";
import { validateAudioFile } from "~/lib/audio";
import { uploadFile } from "~/lib/upload";
import { AudioPlayer } from "../audio-player";
import { FileDropzone } from "../file-dropzone";

export function Sound({
  sound,
  onDelete,
}: {
  sound: Sound;
  onDelete: () => void;
}) {
  const updateMutation = useUpdateSoundValue();
  const getUploadUrlMutation = useUploadSoundUrl();

  const [isEditing, setIsEditing] = useState(false);

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
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Upload failed");
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
              className="text-gray-400 hover:text-blue-400 transition-colors"
            >
              <CgPen size={18} />
            </button>
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-gray-400 hover:text-red-400 transition-colors ml-2"
        >
          <CgTrash size={18} />
        </button>
      </div>
      <AudioPlayer src={sound.value} />
    </div>
  );
}
