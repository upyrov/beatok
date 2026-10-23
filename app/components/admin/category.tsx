import { Input as BaseInput } from "@base-ui/react";
import {
  CaretDown,
  CaretUp,
  Check,
  PencilSimple,
  Trash,
  X,
} from "@phosphor-icons/react";
import { useState } from "react";
import { useUpdateCategory } from "~/api/category";
import { Knob } from "~/components/knob";
import { Button } from "~/components/ui/button";
import { Sounds } from "./sounds";

export function Category({
  category,
  onDelete,
}: {
  category: { id: string; name: string; randomSoundsCount: number };
  onDelete: () => void;
}) {
  const [showSounds, setShowSounds] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const [editRandomSoundsCount, setEditRandomSoundsCount] = useState(
    category.randomSoundsCount,
  );
  const updateMutation = useUpdateCategory();

  function handleUpdate() {
    if (
      editName === category.name &&
      editRandomSoundsCount === category.randomSoundsCount
    ) {
      setIsEditing(false);
      return;
    }
    updateMutation.mutate(
      {
        id: category.id,
        data: { name: editName, randomSoundsCount: editRandomSoundsCount },
      },
      { onSuccess: () => setIsEditing(false) },
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1 mr-4">
            <BaseInput
              className="flex-1 text-sm system-input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleUpdate();
                if (e.key === "Escape") {
                  setIsEditing(false);
                  setEditName(category.name);
                  setEditRandomSoundsCount(category.randomSoundsCount);
                }
              }}
            />
            <div
              title="Random Sounds Count"
              className="flex items-center justify-center"
            >
              <Knob
                value={editRandomSoundsCount}
                onChange={setEditRandomSoundsCount}
                min={1}
                max={10}
                size={28}
              />
            </div>
            <Button
              onClick={handleUpdate}
              disabled={!editName.trim()}
              variant="outline"
              size="icon"
              className="text-green-500 hover:text-green-600 transition-colors disabled:opacity-50"
            >
              <Check size={18} />
            </Button>
            <Button
              onClick={() => {
                setIsEditing(false);
                setEditName(category.name);
                setEditRandomSoundsCount(category.randomSoundsCount);
              }}
              variant="outline"
              size="icon"
              className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <X size={18} />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <span>{category.name}</span>
            <span
              className="text-[0.625rem] font-bold text-gray-600 dark:text-gray-300 bg-black/10 dark:bg-white/10 rounded px-1.5 py-0.5"
              title="Random sounds count"
            >
              {category.randomSoundsCount}
            </span>
          </div>
        )}
        <div className="flex gap-2 items-center">
          {!isEditing && (
            <Button
              onClick={() => {
                setIsEditing(true);
                setEditName(category.name);
                setEditRandomSoundsCount(category.randomSoundsCount);
              }}
              variant="outline"
              size="icon"
              className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              <PencilSimple size={18} />
            </Button>
          )}
          <Button
            onClick={() => setShowSounds(!showSounds)}
            variant="outline"
            size="icon"
            className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            {showSounds ? <CaretUp size={18} /> : <CaretDown size={18} />}
          </Button>
          <Button
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              if (
                confirm(
                  `Are you sure you want to delete category "${category.name}"?`,
                )
              )
                onDelete();
            }}
            variant="outline"
            size="icon"
            className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            <Trash size={18} />
          </Button>
        </div>
      </div>

      {showSounds && (
        <div className="transition-all duration-200 ease-out starting:opacity-0 starting:translate-y-2">
          <Sounds categoryId={category.id} />
        </div>
      )}
    </div>
  );
}
