import { useState } from "react";
import { Sounds } from "../sounds";

export function CategoryItem({
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
