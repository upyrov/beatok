import { Input as BaseInput } from "@base-ui/react";
import { useState } from "react";
import { CgCheck, CgClose, CgPen, CgTrash } from "react-icons/cg";
import { useUpdateSound, useUploadSoundUrl } from "~/api/sound";
import type { Sound } from "~/api/types/sound";
import { Button } from "~/components/ui/button";
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
                  className="flex-1 text-sm text-center system-input"
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
                <Button
                  onClick={handleNameUpdate}
                  disabled={!editName.trim()}
                  variant="outline"
                  size="icon"
                  className="text-green-500 hover:text-green-600 transition-colors disabled:opacity-50"
                >
                  <CgCheck size={18} />
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setEditName(sound.name);
                  }}
                  variant="outline"
                  size="icon"
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <CgClose size={18} />
                </Button>
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
            </div>
          )}
        </div>
        <div className="flex gap-2 items-center self-start mt-1">
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="icon"
              className="text-gray-500 hover:text-blue-500 transition-colors"
            >
              <CgPen size={18} />
            </Button>
          )}
          <Button
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onDelete();
            }}
            variant="outline"
            size="icon"
            className="text-gray-500 hover:text-red-500 transition-colors"
          >
            <CgTrash size={18} />
          </Button>
        </div>
      </div>
      {!isEditing && <AudioPlayer src={sound.value} />}
    </div>
  );
}
