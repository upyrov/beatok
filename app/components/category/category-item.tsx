import { useState } from "react";
import { Sounds } from "../sounds";
import {
  CgChevronDown,
  CgChevronUp,
  CgTrash,
  CgPen,
  CgCheck,
  CgClose,
} from "react-icons/cg";
import { useUpdateCategoryName } from "~/api/categories";

export function CategoryItem({
  category,
  onDelete,
}: {
  category: { id: string; name: string };
  onDelete: () => void;
}) {
  const [showSounds, setShowSounds] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const updateMutation = useUpdateCategoryName();

  function handleUpdate() {
    if (!editName.trim() || editName === category.name) {
      setIsEditing(false);
      setEditName(category.name);
      return;
    }
    updateMutation.mutate(
      { id: category.id, data: { name: editName } },
      { onSuccess: () => setIsEditing(false) },
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1 mr-4">
            <input
              className="bg-gray-50 px-2 py-1 rounded border border-gray-300 text-gray-900 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleUpdate();
                if (e.key === "Escape") {
                  setIsEditing(false);
                  setEditName(category.name);
                }
              }}
            />
            <button
              onClick={handleUpdate}
              className="text-green-400 hover:text-green-300"
            >
              <CgCheck />
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditName(category.name);
              }}
              className="text-red-400 hover:text-red-300"
            >
              <CgClose />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <span>{category.name}</span>
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-500 hover:text-gray-900"
            >
              <CgPen />
            </button>
          </div>
        )}
        <div className="flex gap-2 items-center">
          <button onClick={() => setShowSounds(!showSounds)}>
            {showSounds ? <CgChevronUp /> : <CgChevronDown />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (
                confirm(
                  `Are you sure you want to delete category "${category.name}"?`,
                )
              )
                onDelete();
            }}
          >
            <CgTrash />
          </button>
        </div>
      </div>

      {showSounds && (
        <div>
          <Sounds categoryId={category.id} />
        </div>
      )}
    </div>
  );
}
