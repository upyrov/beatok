import { useForm } from "@tanstack/react-form";
import { type } from "arktype";
import { useNavigate } from "react-router";
import { genresQueryOptions, useGenres } from "~/api/genre";
import { useCreateLobby } from "~/api/lobby";
import { Button } from "~/components/button";
import { FieldError } from "~/components/field-error";
import { MutationBoundary } from "~/components/mutation-boundary";
import { QueryBoundary } from "~/components/query-boundary";
import { getQueryClient } from "~/lib/query-client";

export async function clientLoader() {
  await getQueryClient().prefetchQuery(genresQueryOptions());
}

export default function NewLobby() {
  const navigate = useNavigate();
  const createLobbyMutation = useCreateLobby();
  const genresQuery = useGenres();

  const form = useForm({
    defaultValues: {
      name: "",
      genreId: "",
      participantLimit: 10,
      submissionTime: 10,
    },
    onSubmit: async ({ value }) => {
      try {
        const createdLobbyId = await createLobbyMutation.mutateAsync({
          name: value.name,
          genreId: value.genreId,
          participantLimit: Number(value.participantLimit),
          submissionTime: `00:${String(value.submissionTime).padStart(2, "0")}:00`,
        });
        navigate(`/lobbies/${createdLobbyId}`);
      } catch (error) {
        console.error(error);
      }
    },
  });

  return (
    <main className="container mx-auto p-4 md:p-8 max-w-2xl flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Create New Lobby</h1>
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
            onChange: type("string >= 3"),
          }}
          children={(field) => (
            <div className="flex flex-col gap-1">
              <label className="font-medium">Lobby Name</label>
              <input
                type="text"
                className="border p-2"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldError errors={field.state.meta.errors} />
            </div>
          )}
        />

        <form.Field
          name="genreId"
          validators={{
            onChange: type("string > 0"),
          }}
          children={(field) => (
            <div className="flex flex-col gap-1">
              <label className="font-medium">Genre</label>
              <QueryBoundary query={genresQuery}>
                {(genres) => (
                  <select
                    className="border p-2"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  >
                    <option value="">Select a genre</option>
                    {genres.map((genre) => (
                      <option key={genre.id} value={genre.id}>
                        {genre.name}
                      </option>
                    ))}
                  </select>
                )}
              </QueryBoundary>
              <FieldError errors={field.state.meta.errors} />
            </div>
          )}
        />

        <form.Field
          name="participantLimit"
          validators={{
            onChange: type("number >= 2"),
          }}
          children={(field) => (
            <div className="flex flex-col gap-1">
              <label className="font-medium">Participant Limit</label>
              <input
                type="number"
                min="2"
                className="border p-2"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value))}
              />
              <FieldError errors={field.state.meta.errors} />
            </div>
          )}
        />

        <form.Field
          name="submissionTime"
          validators={{
            onChange: type("3 <= number <= 30"),
          }}
          children={(field) => (
            <div className="flex flex-col gap-1">
              <label className="font-medium">
                Submission Deadline (minutes)
              </label>
              <input
                type="number"
                min="3"
                max="30"
                className="border p-2"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value))}
              />
              <FieldError errors={field.state.meta.errors} />
            </div>
          )}
        />

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit}
              isPending={isSubmitting || createLobbyMutation.isPending}
              className="mt-4 p-2 bg-gray-200 hover:bg-gray-300 font-medium rounded"
            >
              Create Lobby
            </Button>
          )}
        />

        <MutationBoundary error={createLobbyMutation.error} />
      </form>
    </main>
  );
}
