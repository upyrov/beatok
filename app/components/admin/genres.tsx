import { useForm } from "@tanstack/react-form";
import { type } from "arktype";
import { CgAdd } from "react-icons/cg";
import { useCreateGenre, useGenres } from "~/api/genre";
import { ActionButton } from "~/components/action-button";
import { FieldError } from "~/components/field-error";
import { MutationBoundary } from "~/components/mutation-boundary";
import { QueryBoundary } from "~/components/query-boundary";
import { Genre } from "./genre";

export function Genres() {
  const genresQuery = useGenres();
  const createMutation = useCreateGenre();

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
        <h2 className="text-xl font-semibold mb-4 text-white/90">
          Create New Genre
        </h2>
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
                    placeholder="Genre name..."
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
          <MutationBoundary error={createMutation.error} />
        </form>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold mb-2 text-white/90">All Genres</h2>
        <QueryBoundary query={genresQuery}>
          {(genres) => (
            <div className="flex flex-col gap-2">
              {genres.map((genre) => (
                <Genre key={genre.id} genre={genre} />
              ))}
              {!genres.length && <p>No genres found. Create one above!</p>}
            </div>
          )}
        </QueryBoundary>
      </div>
    </div>
  );
}
