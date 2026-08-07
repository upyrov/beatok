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
import { MutationBoundary } from "~/components/mutation-boundary";
import { QueryBoundary } from "~/components/query-boundary";
import { Category } from "./category";import { Input as BaseInput, Form as BaseForm } from "@base-ui/react";


export function Categories({ kitId }: { kitId: string }) {
  const categoriesQuery = useCategories(kitId);
  const createMutation = useCreateCategory();
  const deleteMutation = useDeleteCategory();

  const form = useForm({
    defaultValues: { name: "" },
    onSubmit: async ({ value }) => {
      await createMutation.mutateAsync({ name: value.name.trim(), kitId });
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
        <form.Field
          name="name"
          validators={{
            onChange: type("string > 0"),
          }}
          children={(field) => (
            <div className="flex flex-col gap-1">
              <div className="flex gap-2">
                <BaseInput
                  name={field.name}
                  className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="New category name..."
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
      </BaseForm>

      <div className="flex-1">
        <QueryBoundary query={categoriesQuery}>
          {(categories) => (
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
          )}
        </QueryBoundary>
      </div>
    </div>
  );
}
