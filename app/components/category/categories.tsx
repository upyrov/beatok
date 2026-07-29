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
import { CgAdd } from "react-icons/cg";

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
                  className="flex-1"
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
                      disabled={!canSubmit}
                      isPending={isSubmitting || createMutation.isPending}
                    >
                      <CgAdd />
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
              {categories.length === 0 && <p>No categories found</p>}
            </div>
          )}
        </QueryBoundary>
      </div>
    </div>
  );
}
