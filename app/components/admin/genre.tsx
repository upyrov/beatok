import { Input as BaseInput } from "@base-ui/react";
import { useState } from "react";
import { CgCheck, CgClose, CgPen, CgTrash } from "react-icons/cg";
import { useDeleteGenre, useUpdateGenreName } from "~/api/genre";
import type { Genre as IGenre } from "~/api/types/genre";
import { Button } from "~/components/ui/button";

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
          className="flex-1 text-sm text-center system-input"
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
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending || !editName.trim()}
            variant="outline"
            size="icon"
            className="text-green-500 hover:text-green-600 transition-colors disabled:opacity-50"
          >
            <CgCheck size={18} />
          </Button>
          <Button
            onClick={() => {
              setIsEditing(false);
              setEditName(genre.name);
            }}
            variant="outline"
            size="icon"
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <CgClose size={18} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center py-1">
      <span>{genre.name}</span>
      <div className="flex items-center gap-2">
        <Button
          onClick={() => setIsEditing(true)}
          variant="outline"
          size="icon"
          className="text-gray-500 hover:text-blue-500 transition-colors"
        >
          <CgPen size={18} />
        </Button>
        <Button
          onClick={() => {
            if (confirm(`Delete genre "${genre.name}"?`)) {
              deleteMutation.mutate(genre.id);
            }
          }}
          variant="outline"
          size="icon"
          className="text-gray-500 hover:text-red-500 transition-colors"
        >
          <CgTrash size={18} />
        </Button>
      </div>
    </div>
  );
}
