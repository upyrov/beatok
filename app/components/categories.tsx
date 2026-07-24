import { useState } from "react";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from "~/api/categories";
import { QueryBoundary } from "~/components/query-boundary";
import { Sounds } from "./sounds";

export function Categories({ kitId }: { kitId: string }) {
  const categoriesQuery = useCategories(kitId);
  const createMutation = useCreateCategory();
  const deleteMutation = useDeleteCategory();

  const [newName, setNewName] = useState("");

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newName.trim()) return;
    await createMutation.mutateAsync({ name: newName.trim(), kitId });
    setNewName("");
  }

  return (
    <div className="flex flex-col gap-4 flex-1">
      <form onSubmit={handleCreate} className="flex gap-2 mb-2">
        <input
          className="flex-1 bg-black/20 border border-white/10 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
          placeholder="New category name..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button
          type="submit"
          className="bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded text-sm transition-colors disabled:opacity-50"
          disabled={createMutation.isPending || !newName.trim()}
        >
          Add Category
        </button>
      </form>

      <div className="flex-1">
        <QueryBoundary query={categoriesQuery}>
          {(categories) => (
            <div className="flex flex-col gap-3">
              {categories.map((cat) => (
                <CategoryItem
                  key={cat.id}
                  category={cat}
                  onDelete={() => deleteMutation.mutate(cat.id)}
                />
              ))}
              {categories.length === 0 && (
                <p className="text-white/40 text-sm text-center py-4">
                  No categories found
                </p>
              )}
            </div>
          )}
        </QueryBoundary>
      </div>
    </div>
  );
}

function CategoryItem({
  category,
  onDelete,
}: {
  category: { id: string; name: string };
  onDelete: () => void;
}) {
  const [showSounds, setShowSounds] = useState(false);

  return (
    <div className="border border-white/5 rounded-lg bg-white/5 overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-transparent hover:bg-white/5 transition-colors">
        <span className="truncate flex-1 font-medium">{category.name}</span>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setShowSounds(!showSounds)}
            className={`px-3 py-1 rounded text-xs transition-colors font-medium border ${
              showSounds
                ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                : "bg-white/10 text-white border-transparent hover:bg-white/20"
            }`}
          >
            {showSounds ? "Hide Sounds" : "Fetch Sounds"}
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
            className="text-red-400 hover:bg-red-400/20 px-2 py-1 rounded text-xs transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {showSounds && (
        <div className="p-3 border-t border-white/5 bg-black/40">
          <Sounds categoryId={category.id} />
        </div>
      )}
    </div>
  );
}
