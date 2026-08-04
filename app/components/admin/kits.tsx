import { useForm } from "@tanstack/react-form";
import { type } from "arktype";
import { CgAdd } from "react-icons/cg";
import { useGenres } from "~/api/genre";
import { useCreateKit, useDeleteKit, useKits } from "~/api/kit";
import { ActionButton } from "~/components/action-button";
import { FieldError } from "~/components/field-error";
import { MutationBoundary } from "~/components/mutation-boundary";
import { QueryBoundary } from "~/components/query-boundary";
import { Kit } from "./kit";

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
                <Kit
                  key={kit.id}
                  kit={kit}
                  onDelete={() => deleteMutation.mutate(kit.id)}
                />
              ))}
              {!kits.length && <p>No kits found. Create one above!</p>}
            </div>
          )}
        </QueryBoundary>
      </div>
    </div>
  );
}
