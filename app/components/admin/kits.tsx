import { type } from "arktype";
import { CgAdd } from "react-icons/cg";
import { useGenres } from "~/api/genre";
import { useCreateKit, useDeleteKit, useKits } from "~/api/kit";
import { ActionButton } from "~/components/action-button";
import { CrudManager } from "~/components/crud-manager";
import { InputField } from "~/components/input-field";
import { Button } from "~/components/ui/button";
import { Kit } from "./kit";

export function Kits() {
  const kitsQuery = useKits();
  const kits = kitsQuery.data ?? [];
  const { data: genres = [] } = useGenres();
  const createMutation = useCreateKit();
  const deleteMutation = useDeleteKit();

  return (
    <CrudManager
      items={kits}
      emptyMessage="No kits found. Create one above!"
      defaultValues={{ name: "", genreIds: [] as string[] }}
      onSubmit={async (value) => {
        await createMutation.mutateAsync({
          name: value.name.trim(),
          genreIds: value.genreIds,
        });
      }}
      createMutationError={createMutation.error}
      renderItem={(kit) => (
        <Kit
          key={kit.id}
          kit={kit}
          onDelete={() => deleteMutation.mutate(kit.id)}
        />
      )}
      renderFormFields={(form) => (
        <>
          <form.Field
            name="name"
            validators={{
              onChange: type("string > 0"),
            }}
            children={(field: any) => (
              <div className="flex gap-2 items-start">
                <InputField
                  name={field.name}
                  value={field.state.value}
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                  errors={field.state.meta.errors}
                  placeholder="Kit name"
                  className="flex-1"
                  inputClassName="text-center"
                />
                <form.Subscribe
                  selector={(state: any) => [
                    state.canSubmit,
                    state.isSubmitting,
                  ]}
                  children={([canSubmit, isSubmitting]: [boolean, boolean]) => (
                    <ActionButton
                      type="submit"
                      disabled={!canSubmit}
                      pending={isSubmitting || createMutation.isPending}
                    >
                      <CgAdd />
                    </ActionButton>
                  )}
                />
              </div>
            )}
          />

          <form.Field
            name="genreIds"
            children={(field: any) => (
              <>
                {genres.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    <span className="flex items-center">Genres:</span>
                    {genres.map((genre) => {
                      const isSelected = field.state.value.includes(genre.id);
                      return (
                        <Button
                          key={genre.id}
                          type="button"
                          onClick={() => {
                            const prev = field.state.value;
                            field.handleChange(
                              isSelected
                                ? prev.filter((g: string) => g !== genre.id)
                                : [...prev, genre.id],
                            );
                          }}
                          className={`text-sm px-2 py-1 rounded transition-colors ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-muted text-foreground hover:bg-muted-hover"
                          }`}
                        >
                          {genre.name}
                        </Button>
                      );
                    })}
                  </div>
                ) : (
                  <p>No genres available to select.</p>
                )}
              </>
            )}
          />
        </>
      )}
    />
  );
}
