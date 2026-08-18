import { Form as BaseForm, Input as BaseInput, Select } from "@base-ui/react";
import { useForm } from "@tanstack/react-form";
import { type } from "arktype";
import { useNavigate } from "react-router";
import { useGenres } from "~/api/genre";
import { useCreateLobby } from "~/api/lobby";
import { ActionButton } from "~/components/action-button";
import { FieldError } from "~/components/field-error";
import { Knob } from "~/components/knob";
import { MutationBoundary } from "~/components/mutation-boundary";
import type { Route } from "./+types/new";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Beatok | Create Lobby" },
    {
      name: "description",
      content: "Create a new beat battle lobby on Beatok.",
    },
  ];
}

export default function NewLobby() {
  const navigate = useNavigate();
  const createLobbyMutation = useCreateLobby();
  const genresQuery = useGenres();
  const genres = genresQuery.data ?? [];

  const form = useForm({
    defaultValues: {
      name: "My Lobby",
      genreId: "",
      participantLimit: 5,
      submissionTime: 30,
    },
    onSubmit: async ({ value }) => {
      if (createLobbyMutation.isPending) return;
      try {
        const hours = Math.floor(value.submissionTime / 60);
        const minutes = value.submissionTime % 60;

        const createdLobbyId = await createLobbyMutation.mutateAsync({
          name: value.name,
          genreId: value.genreId,
          participantLimit: Number(value.participantLimit),
          submissionTime: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`,
        });
        navigate(`/lobbies/${createdLobbyId}`);
      } catch (error) {
        console.error(error);
      }
    },
  });

  return (
    <main className="container mx-auto p-4 md:p-8 max-w-2xl flex flex-col gap-6">
      <BaseForm
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
              <label className="font-medium text-gray-700 dark:text-gray-300">
                Name
              </label>
              <BaseInput
                id="genreId"
                type="text"
                className="w-full system-input"
                placeholder="My Lobby"
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
              <label className="font-medium text-gray-700 dark:text-gray-300">
                Genre
              </label>
              <Select.Root
                value={field.state.value || null}
                onValueChange={(value) => field.handleChange(value!)}
              >
                <Select.Trigger
                  className="system-input flex justify-between items-center w-full"
                  onBlur={field.handleBlur}
                >
                  <Select.Value
                    placeholder="Select a genre"
                    className="flex-1 text-left"
                  >
                    {(value) =>
                      value
                        ? genres.find((g) => g.id === value)?.name
                        : "Select a genre"
                    }
                  </Select.Value>
                  <Select.Icon />
                </Select.Trigger>
                <Select.Portal>
                  <Select.Positioner
                    side="bottom"
                    align="start"
                    alignItemWithTrigger={false}
                    sideOffset={4}
                  >
                    <Select.Popup className="system-popup min-w-(--anchor-width)">
                      {genres.map((genre) => (
                        <Select.Item
                          key={genre.id}
                          value={genre.id}
                          className="system-popup-item"
                        >
                          <Select.ItemText>{genre.name}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Popup>
                  </Select.Positioner>
                </Select.Portal>
              </Select.Root>
              <FieldError errors={field.state.meta.errors} />
            </div>
          )}
        />

        <div className="system-panel flex gap-12 justify-center items-center p-6 mt-4">
          <form.Field
            name="participantLimit"
            validators={{
              onChange: type("number >= 2"),
            }}
            children={(field) => (
              <div className="flex flex-col items-center gap-3">
                <label className="font-medium text-xs text-gray-700 dark:text-gray-300 tracking-wide">
                  Max Participants
                </label>
                <Knob
                  value={field.state.value}
                  onChange={(val) => field.handleChange(val)}
                  min={2}
                  max={50}
                  color="#4ade80"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-200">
                  {field.state.value}
                </span>
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          />

          <form.Field
            name="submissionTime"
            validators={{
              onChange: type("3 <= number <= 120"),
            }}
            children={(field) => (
              <div className="flex flex-col items-center gap-3">
                <label className="font-medium text-xs text-gray-700 dark:text-gray-300 tracking-wide">
                  Submission Time
                </label>
                <Knob
                  value={field.state.value}
                  onChange={(val) => field.handleChange(val)}
                  min={3}
                  max={120}
                  color="#fb923c"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-200">
                  {field.state.value}m
                </span>
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          />
        </div>

        <form.Subscribe
          selector={(state) => ({
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
            name: state.values.name,
            genreId: state.values.genreId,
          })}
          children={({ canSubmit, isSubmitting, name, genreId }) => {
            const isDisabled = !canSubmit || !name || !genreId;
            return (
              <ActionButton
                type="submit"
                disabled={isDisabled}
                pending={isSubmitting || createLobbyMutation.isPending}
              >
                Create Lobby
              </ActionButton>
            );
          }}
        />

        <MutationBoundary error={createLobbyMutation.error} />
      </BaseForm>
    </main>
  );
}
