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
import { useGenres } from "~/api/genre";
import { useUpdateKit } from "~/api/kit";
import type { Kit as IKit } from "~/api/types/kit";
import { Button } from "~/components/ui/button";
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
                  className="flex-1 text-sm system-input"
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
                    setEditName(kit.name);
                    setEditGenreIds(kit.genres?.map((g) => g.id) ?? []);
                  }}
                  variant="outline"
                  size="icon"
                  className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  <X size={18} />
                </Button>
              </div>
              {genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {genres.map((genre) => {
                    const isSelected = editGenreIds.includes(genre.id);
                    return (
                      <Button
                        key={genre.id}
                        type="button"
                        onClick={() => {
                          setEditGenreIds(
                            isSelected
                              ? editGenreIds.filter((id) => id !== genre.id)
                              : [...editGenreIds, genre.id],
                          );
                        }}
                        className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                          isSelected
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-muted text-foreground hover:bg-muted-hover"
                        }`}
                      >
                        {genre.name}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <span>{kit.name}</span>
            </div>
          )}
          {kit.genres?.length > 0 && !isEditing && (
            <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Genres: {kit.genres.map((g) => g.name).join(", ")}
            </span>
          )}
        </div>
        <div className="flex gap-2 items-center">
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="icon"
              className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              <PencilSimple size={18} />
            </Button>
          )}
          <Button
            onClick={() => setShowCategories(!showCategories)}
            variant="outline"
            size="icon"
            className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            {showCategories ? <CaretUp size={18} /> : <CaretDown size={18} />}
          </Button>
          <Button
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              if (confirm(`Are you sure you want to delete kit "${kit.name}"?`))
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

      {showCategories && (
        <div className="transition-all duration-200 ease-out starting:opacity-0 starting:translate-y-2">
          <Categories kitId={kit.id} />
        </div>
      )}
    </div>
  );
}
