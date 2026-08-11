import { Button as BaseButton, Input as BaseInput } from "@base-ui/react";
import { useState } from "react";
import {
  CgCheck,
  CgChevronDown,
  CgChevronUp,
  CgClose,
  CgPen,
  CgTrash,
} from "react-icons/cg";
import { useGenres } from "~/api/genre";
import { useUpdateKit } from "~/api/kit";
import type { Kit as IKit } from "~/api/types/kit";
import { Categories } from "./categories";

export function Kit({ kit, onDelete }: { kit: IKit; onDelete: () => void }) {
  const [showCategories, setShowCategories] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(kit.name);
  const [editGenreIds, setEditGenreIds] = useState<string[]>(
    kit.genres?.map((g) => g.id) ?? [],
  );
  const { data: genres = [] } = useGenres();
  const updateMutation = useUpdateKit();

  function handleUpdate() {
    if (
      !editName.trim() ||
      (editName === kit.name &&
        JSON.stringify([...editGenreIds].sort()) ===
          JSON.stringify((kit.genres?.map((g) => g.id) ?? []).sort()))
    ) {
      setIsEditing(false);
      setEditName(kit.name);
      setEditGenreIds(kit.genres?.map((g) => g.id) ?? []);
      return;
    }
    updateMutation.mutate(
      {
        id: kit.id,
        data: { name: editName, genreIds: editGenreIds },
      },
      { onSuccess: () => setIsEditing(false) },
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
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
                    if (e.key === "Enter") handleUpdate();
                    if (e.key === "Escape") {
                      setIsEditing(false);
                      setEditName(kit.name);
                      setEditGenreIds(kit.genres?.map((g) => g.id) ?? []);
                    }
                  }}
                />
                <BaseButton
                  onClick={handleUpdate}
                  disabled={!editName.trim()}
                  className="text-green-400 hover:text-green-300 transition-colors disabled:opacity-50"
                >
                  <CgCheck size={18} />
                </BaseButton>
                <BaseButton
                  onClick={() => {
                    setIsEditing(false);
                    setEditName(kit.name);
                    setEditGenreIds(kit.genres?.map((g) => g.id) ?? []);
                  }}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <CgClose size={18} />
                </BaseButton>
              </div>
              {genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {genres.map((genre) => {
                    const isSelected = editGenreIds.includes(genre.id);
                    return (
                      <BaseButton
                        key={genre.id}
                        type="button"
                        onClick={() => {
                          setEditGenreIds(
                            isSelected
                              ? editGenreIds.filter((id) => id !== genre.id)
                              : [...editGenreIds, genre.id],
                          );
                        }}
                        className={`text-xs px-2 py-1 rounded transition-colors ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-black/10 dark:bg-white/10 text-gray-300 hover:bg-white/20"
                        }`}
                      >
                        {genre.name}
                      </BaseButton>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <span>{kit.name}</span>
              <BaseButton
                onClick={() => setIsEditing(true)}
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <CgPen size={18} />
              </BaseButton>
            </div>
          )}
          {kit.genres?.length > 0 && !isEditing && (
            <span className="text-sm text-gray-500">
              Genres: {kit.genres.map((g) => g.name).join(", ")}
            </span>
          )}
        </div>
        <div className="flex gap-3 items-center">
          <BaseButton
            onClick={() => setShowCategories(!showCategories)}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            {showCategories ? (
              <CgChevronUp size={18} />
            ) : (
              <CgChevronDown size={18} />
            )}
          </BaseButton>
          <BaseButton
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Are you sure you want to delete kit "${kit.name}"?`))
                onDelete();
            }}
            className="text-gray-400 hover:text-red-400 transition-colors"
          >
            <CgTrash size={18} />
          </BaseButton>
        </div>
      </div>

      {showCategories && (
        <div className="animate-fade-in">
          <Categories kitId={kit.id} />
        </div>
      )}
    </div>
  );
}
