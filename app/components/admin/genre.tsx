import { Button as BaseButton, Input as BaseInput } from "@base-ui/react";
import { useState } from "react";
import { CgCheck, CgClose, CgPen, CgTrash } from "react-icons/cg";
import { useDeleteGenre, useUpdateGenreName } from "~/api/genre";
import type { Genre as IGenre } from "~/api/types/genre/genre";

export function Genre({ genre }: { genre: IGenre }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(genre.name);
  const updateMutation = useUpdateGenreName();
  const deleteMutation = useDeleteGenre();

  async function handleSave() {
    if (!editName.trim() || editName.trim() === genre.name) {
      setIsEditing(false);
      return;
    }
    await updateMutation.mutateAsync({
      id: genre.id,
      data: { name: editName.trim() },
    });
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div className="flex justify-between items-center gap-2 py-1">
        <BaseInput
          className="flex-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") {
              setIsEditing(false);
              setEditName(genre.name);
            }
          }}
          autoFocus
        />
        <div className="flex items-center gap-2">
          <BaseButton
            onClick={handleSave}
            disabled={updateMutation.isPending || !editName.trim()}
            className="text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
          >
            <CgCheck size={18} />
          </BaseButton>
          <BaseButton
            onClick={() => {
              setIsEditing(false);
              setEditName(genre.name);
            }}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <CgClose size={18} />
          </BaseButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center py-1">
      <span>{genre.name}</span>
      <div className="flex items-center gap-3">
        <BaseButton
          onClick={() => setIsEditing(true)}
          className="text-gray-400 hover:text-blue-400 transition-colors"
        >
          <CgPen size={18} />
        </BaseButton>
        <BaseButton
          onClick={() => {
            if (confirm(`Delete genre "${genre.name}"?`)) {
              deleteMutation.mutate(genre.id);
            }
          }}
          className="text-gray-400 hover:text-red-400 transition-colors"
        >
          <CgTrash size={18} />
        </BaseButton>
      </div>
    </div>
  );
}
