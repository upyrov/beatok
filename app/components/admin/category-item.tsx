import { useState } from "react";
import {
  CgCheck,
  CgChevronDown,
  CgChevronUp,
  CgClose,
  CgPen,
  CgTrash,
} from "react-icons/cg";
import { useUpdateCategoryName } from "~/api/category";
import { Sounds } from "./sounds";

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
              className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
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
              disabled={!editName.trim()}
              className="text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
            >
              <CgCheck size={18} />
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditName(category.name);
              }}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <CgClose size={18} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1">
            <span>{category.name}</span>
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-400 hover:text-blue-400 transition-colors"
            >
              <CgPen size={18} />
            </button>
          </div>
        )}
        <div className="flex gap-3 items-center">
          <button
            onClick={() => setShowSounds(!showSounds)}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            {showSounds ? (
              <CgChevronUp size={18} />
            ) : (
              <CgChevronDown size={18} />
            )}
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
            className="text-gray-400 hover:text-red-400 transition-colors"
          >
            <CgTrash size={18} />
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
