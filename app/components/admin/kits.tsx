import { useForm } from "@tanstack/react-form";
import { type } from "arktype";
import { useState } from "react";
import {
  CgAdd,
  CgCheck,
  CgChevronDown,
  CgChevronUp,
  CgClose,
  CgPen,
  CgTrash,
} from "react-icons/cg";
import { useGenres } from "~/api/genre";
import {
  useCreateKit,
  useDeleteKit,
  useKits,
  useUpdateKitName,
} from "~/api/kit";
import type { Kit } from "~/api/types/kit/kit";
import { ActionButton } from "~/components/action-button";
import { FieldError } from "~/components/field-error";
import { MutationBoundary } from "~/components/mutation-boundary";
import { QueryBoundary } from "~/components/query-boundary";
import { Categories } from "./categories";

export function Kits() {
  const kitsQuery = useKits();
  const { data: genres = [] } = useGenres();
  const createMutation = useCreateKit();
  const deleteMutation = useDeleteKit();

  const form = useForm({
    defaultValues: {
      name: "",
      genreIds: [] as string[],
    },
    onSubmit: async ({ value }) => {
      await createMutation.mutateAsync({
        name: value.name.trim(),
        genreIds: value.genreIds,
      });
      form.reset();
    },
  });

  return (
    <div className="flex flex-col gap-6 flex-1">
      <div>
        <h2>Create New Kit</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <form.Field
            name="name"
            validators={{
              onChange: type("string > 0"),
            }}
            children={(field) => (
              <div className="flex flex-col gap-1">
                <div className="flex gap-2">
                  <input
                    name={field.name}
                    className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="Kit name..."
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                      <ActionButton
                        disabled={!canSubmit}
                        isPending={isSubmitting || createMutation.isPending}
                      >
                        <CgAdd />
                      </ActionButton>
                    )}
                  />
                </div>
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          />

          <form.Field
            name="genreIds"
            children={(field) => (
              <>
                {genres.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    <span className="flex items-center">Genres:</span>
                    {genres.map((genre) => {
                      const isSelected = field.state.value.includes(genre.id);
                      return (
                        <button
                          key={genre.id}
                          type="button"
                          onClick={() => {
                            const prev = field.state.value;
                            field.handleChange(
                              isSelected
                                ? prev.filter((g) => g !== genre.id)
                                : [...prev, genre.id],
                            );
                          }}
                          className={`text-sm px-2 py-1 rounded transition-colors ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-white/10 text-gray-300 hover:bg-white/20"
                          }`}
                        >
                          {genre.name}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p>No genres available to select.</p>
                )}
              </>
            )}
          />

          <MutationBoundary error={createMutation.error} />
        </form>
      </div>

      <div className="flex flex-col gap-4">
        <h2>All Kits</h2>
        <QueryBoundary query={kitsQuery}>
          {(kits) => (
            <div className="flex flex-col gap-4">
              {kits.map((kit) => (
                <KitItem
                  key={kit.id}
                  kit={kit}
                  onDelete={() => deleteMutation.mutate(kit.id)}
                />
              ))}
              {kits.length === 0 && <p>No kits found. Create one above!</p>}
            </div>
          )}
        </QueryBoundary>
      </div>
    </div>
  );
}

function KitItem({ kit, onDelete }: { kit: Kit; onDelete: () => void }) {
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
