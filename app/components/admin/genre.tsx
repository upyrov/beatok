import { Input as BaseInput } from "@base-ui/react";
import { Check, PencilSimple, Trash, X } from "@phosphor-icons/react";
import { useState } from "react";
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
          className="flex-1 text-sm system-input"
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
            <Check size={18} />
          </Button>
          <Button
            onClick={() => {
              setIsEditing(false);
              setEditName(genre.name);
            }}
            variant="outline"
            size="icon"
            className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <X size={18} />
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
          className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
        >
          <PencilSimple size={18} />
        </Button>
        <Button
          onClick={() => {
            if (
              confirm(`Are you sure you want to delete genre "${genre.name}"?`)
            ) {
              deleteMutation.mutate(genre.id);
            }
          }}
          variant="outline"
          size="icon"
          className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
        >
          <Trash size={18} />
        </Button>
      </div>
    </div>
  );
}
