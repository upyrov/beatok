import { Button as BaseButton, Input as BaseInput } from "@base-ui/react";
import { useState } from "react";
import { CgCheck, CgClose, CgPen, CgTrash } from "react-icons/cg";
import { useUpdateSound, useUploadSoundUrl } from "~/api/sound";
import type { Sound } from "~/api/types/sound";
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
  const updateMutation = useUpdateSound();
  const getUploadUrlMutation = useUploadSoundUrl();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(sound.name);

  async function handleUpdate(
    file: File,
    onProgress: (progress: number) => void,
  ) {
    try {
      const validation = await validateAudioFile(file);
      if (!validation.valid) throw new Error(validation.error);

      const fileExtension = file.name.split(".").pop() ?? "";
      const { uploadUrl, fileKey } = await getUploadUrlMutation.mutateAsync({
        extension: fileExtension,
        contentType: file.type,
      });

      await uploadFile(file, uploadUrl, onProgress);

      updateMutation.mutate(
        { id: sound.id, data: { name: editName, value: fileKey } },
        { onSuccess: () => setIsEditing(false) },
      );
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Upload failed");
    }
  }

  function handleNameUpdate() {
    if (!editName.trim() || editName === sound.name) {
      setIsEditing(false);
      setEditName(sound.name);
      return;
    }
    updateMutation.mutate(
      { id: sound.id, data: { name: editName, value: sound.value } },
      { onSuccess: () => setIsEditing(false) },
    );
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex flex-col flex-1 mr-4">
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <BaseInput
                  className="flex-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleNameUpdate();
                    if (e.key === "Escape") {
                      setIsEditing(false);
                      setEditName(sound.name);
                    }
                  }}
                />
                <BaseButton
                  onClick={handleNameUpdate}
                  disabled={!editName.trim()}
                  className="text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
                >
                  <CgCheck size={18} />
                </BaseButton>
                <BaseButton
                  onClick={() => {
                    setIsEditing(false);
                    setEditName(sound.name);
                  }}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <CgClose size={18} />
                </BaseButton>
              </div>
              <FileDropzone
                label="Drop new sound file here to replace"
                maxFiles={1}
                onUpload={handleUpdate}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <span className="font-medium text-sm">{sound.name}</span>
              <BaseButton
                onClick={() => setIsEditing(true)}
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <CgPen size={18} />
              </BaseButton>
            </div>
          )}
        </div>
        <BaseButton
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-gray-400 hover:text-red-400 transition-colors self-start mt-1"
        >
          <CgTrash size={18} />
        </BaseButton>
      </div>
      {!isEditing && <AudioPlayer src={sound.value} />}
    </div>
  );
}
