import { useState } from "react";
import {
  CgCheck,
  CgChevronDown,
  CgChevronUp,
  CgClose,
  CgPen,
  CgTrash,
} from "react-icons/cg";
import { useUpdateKitName } from "~/api/kit";
import type { Kit as IKit } from "~/api/types/kit/kit";
import { Categories } from "./categories";

export function Kit({ kit, onDelete }: { kit: IKit; onDelete: () => void }) {
  const [showCategories, setShowCategories] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(kit.name);
  const updateMutation = useUpdateKitName();

  function handleUpdate() {
    if (!editName.trim() || editName === kit.name) {
      setIsEditing(false);
      setEditName(kit.name);
      return;
    }
    updateMutation.mutate(
      {
        id: kit.id,
        data: { name: editName, genreIds: kit.genres?.map((g) => g.id) || [] },
      },
      { onSuccess: () => setIsEditing(false) },
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex flex-col flex-1 mr-4">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUpdate();
                  if (e.key === "Escape") {
                    setIsEditing(false);
                    setEditName(kit.name);
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
                  setEditName(kit.name);
                }}
                className="text-gray-400 hover:text-gray-300 transition-colors"
              >
                <CgClose size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <span>{kit.name}</span>
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <CgPen size={18} />
              </button>
            </div>
          )}
          {kit.genres?.length > 0 && !isEditing && (
            <span className="text-sm text-gray-500">
              Genres: {kit.genres.map((g) => g.name).join(", ")}
            </span>
          )}
        </div>
        <div className="flex gap-3 items-center">
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            {showCategories ? (
              <CgChevronUp size={18} />
            ) : (
              <CgChevronDown size={18} />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Are you sure you want to delete kit "${kit.name}"?`))
                onDelete();
            }}
            className="text-gray-400 hover:text-red-400 transition-colors"
          >
            <CgTrash size={18} />
          </button>
        </div>
      </div>

      {showCategories && (
        <div>
          <Categories kitId={kit.id} />
        </div>
      )}
    </div>
  );
}
