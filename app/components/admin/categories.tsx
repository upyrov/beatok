import { Form as BaseForm, Input as BaseInput } from "@base-ui/react";
import { useForm } from "@tanstack/react-form";
import { type } from "arktype";
import { CgAdd } from "react-icons/cg";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from "~/api/category";
import { ActionButton } from "~/components/action-button";
import { FieldError } from "~/components/field-error";
import { Knob } from "~/components/knob";
import { MutationBoundary } from "~/components/mutation-boundary";
import { Category } from "./category";

export function Categories({ kitId }: { kitId: string }) {
  const categoriesQuery = useCategories(kitId);
  const categories = categoriesQuery.data || [];
  const createMutation = useCreateCategory();
  const deleteMutation = useDeleteCategory();

  const form = useForm({
    defaultValues: { name: "", randomSoundsCount: 1 },
    onSubmit: async ({ value }) => {
      await createMutation.mutateAsync({
        name: value.name.trim(),
        kitId,
        randomSoundsCount: value.randomSoundsCount,
      });
      form.reset();
    },
  });

  return (
    <div className="flex flex-col gap-4 flex-1">
      <BaseForm
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-1 mb-2"
      >
        <div className="flex gap-2 items-start">
          <form.Field
            name="name"
            validators={{
              onChange: type("string > 0"),
            }}
            children={(field) => (
              <div className="flex flex-col gap-1 flex-1">
                <BaseInput
                  name={field.name}
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="New category name..."
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          />
          <form.Field
            name="randomSoundsCount"
            children={(field) => (
              <div
                title="Random Sounds Count"
                className="flex items-center justify-center"
              >
                <Knob
                  value={field.state.value}
                  onChange={field.handleChange}
                  min={1}
                  max={10}
                  size={42}
                />
              </div>
            )}
          />
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <ActionButton
                type="submit"
                disabled={!canSubmit}
                isPending={isSubmitting || createMutation.isPending}
              >
                <CgAdd />
              </ActionButton>
            )}
          />
        </div>
        <MutationBoundary error={createMutation.error} />
      </BaseForm>

      <div className="flex-1">
        <div className="flex flex-col gap-3">
          {categories.map((cat) => (
            <Category
              key={cat.id}
              category={cat}
              onDelete={() => deleteMutation.mutate(cat.id)}
            />
          ))}
          {!categories.length && <p>No categories found</p>}
        </div>
      </div>
    </div>
  );
}
