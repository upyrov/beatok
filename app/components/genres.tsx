import { useForm } from "@tanstack/react-form";
import { type } from "arktype";
import { useGenres, useCreateGenre, useDeleteGenre } from "~/api/genres";
import { QueryBoundary } from "./error/query-boundary";
import { LoadingButton } from "./loading";
import { FieldError, MutationBoundary } from "./error";
import { CgTrash } from "react-icons/cg";

export function Genres() {
  const genresQuery = useGenres();
  const createMutation = useCreateGenre();
  const deleteMutation = useDeleteGenre();

  const form = useForm({
    defaultValues: { name: "" },
    onSubmit: async ({ value }) => {
      await createMutation.mutateAsync({ name: value.name.trim() });
      form.reset();
    },
  });

  return (
    <div className="flex flex-col gap-6 flex-1">
      <div>
        <h2>Create New Genre</h2>
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
                    className="flex-1"
                    placeholder="Genre name..."
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                      <LoadingButton
                        type="submit"
                        disabled={!canSubmit}
                        isPending={isSubmitting || createMutation.isPending}
                      >
                        Add Genre
                      </LoadingButton>
                    )}
                  />
                </div>
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          />
          <MutationBoundary error={createMutation.error} />
        </form>
      </div>

      <div className="flex flex-col gap-4">
        <h2>All Genres</h2>
        <QueryBoundary query={genresQuery}>
          {(genres) => (
            <div className="flex flex-col gap-2">
              {genres.map((genre) => (
                <div
                  key={genre.id}
                  className="flex justify-between items-center"
                >
                  <span>{genre.name}</span>
                  <button
                    onClick={() => {
                      if (confirm(`Delete genre "${genre.name}"?`)) {
                        deleteMutation.mutate(genre.id);
                      }
                    }}
                  >
                    <CgTrash />
                  </button>
                </div>
              ))}
              {genres.length === 0 && <p>No genres found. Create one above!</p>}
            </div>
          )}
        </QueryBoundary>
      </div>
    </div>
  );
}
