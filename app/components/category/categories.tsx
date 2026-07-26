import { useForm } from "@tanstack/react-form";
import { type } from "arktype";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from "~/api/categories";
import { QueryBoundary } from "../error/query-boundary";
import { LoadingButton } from "../loading";
import { FieldError, MutationBoundary } from "../error";
import { CategoryItem } from "./category-item";

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
      <form
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
                <input
                  name={field.name}
                  className="flex-1 bg-black/20 border border-white/10 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="New category name..."
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                  children={([canSubmit, isSubmitting]) => (
                    <LoadingButton
                      type="submit"
                      className="bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded text-sm transition-colors"
                      disabled={!canSubmit}
                      isPending={isSubmitting || createMutation.isPending}
                      pendingText="Adding..."
                    >
                      Add Category
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

      <div className="flex-1">
        <QueryBoundary query={categoriesQuery}>
          {(categories) => (
            <div className="flex flex-col gap-3">
              {categories.map((cat) => (
                <CategoryItem
                  key={cat.id}
                  category={cat}
                  onDelete={() => deleteMutation.mutate(cat.id)}
                />
              ))}
              {categories.length === 0 && (
                <p className="text-white/40 text-sm text-center py-4">
                  No categories found
                </p>
              )}
            </div>
          )}
        </QueryBoundary>
      </div>
    </div>
  );
}
