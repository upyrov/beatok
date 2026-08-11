import { type } from "arktype";
import { CgAdd } from "react-icons/cg";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from "~/api/category";
import { ActionButton } from "~/components/action-button";
import { CrudManager } from "~/components/crud-manager";
import { InputField } from "~/components/input-field";
import { Knob } from "~/components/knob";
import { Category } from "./category";

export function Categories({ kitId }: { kitId: string }) {
  const categoriesQuery = useCategories(kitId);
  const categories = categoriesQuery.data ?? [];
  const createMutation = useCreateCategory();
  const deleteMutation = useDeleteCategory();

  return (
    <CrudManager
      items={categories}
      emptyMessage="No categories found"
      defaultValues={{ name: "", randomSoundsCount: 1 }}
      onSubmit={async (value) => {
        await createMutation.mutateAsync({
          name: value.name.trim(),
          kitId,
          randomSoundsCount: value.randomSoundsCount,
        });
      }}
      createMutationError={createMutation.error}
      renderItem={(cat) => (
        <Category
          key={cat.id}
          category={cat}
          onDelete={() => deleteMutation.mutate(cat.id)}
        />
      )}
      renderFormFields={(form) => (
        <div className="flex gap-2 items-start">
          <form.Field
            name="name"
            validators={{
              onChange: type("string > 0"),
            }}
            children={(field: any) => (
              <InputField
                name={field.name}
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                errors={field.state.meta.errors}
                placeholder="New category name..."
                className="flex-1"
              />
            )}
          />
          <form.Field
            name="randomSoundsCount"
            children={(field: any) => (
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
            selector={(state: any) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]: [boolean, boolean]) => (
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
      )}
    />
  );
}
