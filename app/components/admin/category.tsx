import { Input as BaseInput, Button } from "@base-ui/react";
import { useState } from "react";
import {
  CgCheck,
  CgChevronDown,
  CgChevronUp,
  CgClose,
  CgPen,
  CgTrash,
} from "react-icons/cg";
import { useUpdateCategory } from "~/api/category";
import { Knob } from "~/components/knob";
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
              className="flex-1 system-input text-sm"
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
              className="text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
            >
              <CgCheck size={18} />
            </Button>
            <Button
              onClick={() => {
                setIsEditing(false);
                setEditName(category.name);
                setEditRandomSoundsCount(category.randomSoundsCount);
              }}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <CgClose size={18} />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <span>{category.name}</span>
            <span
              className="text-[10px] text-gray-500 bg-black/10 dark:bg-white/10 rounded px-1.5 py-0.5"
              title="Random sounds count"
            >
              {category.randomSoundsCount}
            </span>
            <Button
              onClick={() => {
                setIsEditing(true);
                setEditName(category.name);
                setEditRandomSoundsCount(category.randomSoundsCount);
              }}
              className="text-gray-400 hover:text-blue-400 transition-colors"
            >
              <CgPen size={18} />
            </Button>
          </div>
        )}
        <div className="flex gap-3 items-center">
          <Button
            onClick={() => setShowSounds(!showSounds)}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            {showSounds ? (
              <CgChevronUp size={18} />
            ) : (
              <CgChevronDown size={18} />
            )}
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
            className="text-gray-400 hover:text-red-400 transition-colors"
          >
            <CgTrash size={18} />
          </Button>
        </div>
      </div>

      {showSounds && (
        <div className="transition duration-300 starting:opacity-0 starting:translate-y-1">
          <Sounds categoryId={category.id} />
        </div>
      )}
    </div>
  );
}
