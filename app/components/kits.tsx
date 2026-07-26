import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { type } from "arktype";
import { useKits, useCreateKit, useDeleteKit } from "~/api/kits";
import { useGenres } from "~/api/genres";
import { QueryBoundary } from "./error/query-boundary";
import { LoadingButton } from "./loading";
import type { Kit } from "~/api/types/kit/kit";
import { Categories } from "./category/categories";
import { FieldError, MutationBoundary } from "./error";

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
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-3">Create New Kit</h2>
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
                    className="flex-1 bg-black/20 border border-white/10 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Kit name..."
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                      <LoadingButton
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-sm font-medium transition-colors"
                        disabled={!canSubmit}
                        isPending={isSubmitting || createMutation.isPending}
                        pendingText="Adding..."
                      >
                        Add Kit
                      </LoadingButton>
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
                    <span className="text-sm text-white/60 mr-2 flex items-center">
                      Genres:
                    </span>
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
                          className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                            isSelected
                              ? "bg-blue-500/20 border-blue-500/50 text-blue-200"
                              : "bg-black/20 border-white/10 text-white/60 hover:bg-white/10"
                          }`}
                        >
                          {genre.name}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-white/40">
                    No genres available to select.
                  </p>
                )}
              </>
            )}
          />

          <MutationBoundary error={createMutation.error} />
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold border-b border-white/10 pb-2">
          All Kits
        </h2>
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
              {kits.length === 0 && (
                <p className="text-white/50 text-center py-8">
                  No kits found. Create one above!
                </p>
              )}
            </div>
          )}
        </QueryBoundary>
      </div>
    </div>
  );
}

function KitItem({ kit, onDelete }: { kit: Kit; onDelete: () => void }) {
  const [showCategories, setShowCategories] = useState(false);

  return (
    <div className="border border-white/10 rounded-xl bg-black/20 overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors">
        <div className="flex flex-col">
          <span className="font-bold text-lg">{kit.name}</span>
          {kit.genres?.length && (
            <span className="text-xs text-black mt-1">
              Genres: {kit.genres.map((g) => g.name).join(", ")}
            </span>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setShowCategories(!showCategories)}
            className={`px-3 py-1.5 rounded text-sm transition-colors font-medium border ${
              showCategories
                ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                : "bg-white/10 text-white border-transparent hover:bg-white/20"
            }`}
          >
            {showCategories ? "Hide Categories" : "Fetch Categories"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Are you sure you want to delete kit "${kit.name}"?`))
                onDelete();
            }}
            className="text-red-400 hover:bg-red-400/20 px-3 py-1.5 rounded text-sm transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {showCategories && (
        <div className="p-4 border-t border-white/10 bg-black/40">
          <Categories kitId={kit.id} />
        </div>
      )}
    </div>
  );
}
