import { Form as BaseForm } from "@base-ui/react";
import { useForm } from "@tanstack/react-form";
import type { UseMutationResult } from "@tanstack/react-query";
import React from "react";
import { MutationBoundary } from "~/components/mutation-boundary";

interface CrudManagerProps<TItem, TFormData> {
  items: TItem[];
  emptyMessage?: string;
  defaultValues: TFormData;
  onSubmit: (data: TFormData) => Promise<void>;
  createMutationError: UseMutationResult<any, any, any, any>["error"];
  renderFormFields: (form: any) => React.ReactNode;
  renderItem: (item: TItem) => React.ReactNode;
}

export function CrudManager<TItem, TFormData>({
  items,
  emptyMessage = "No items found. Create one above!",
  defaultValues,
  onSubmit,
  createMutationError,
  renderFormFields,
  renderItem,
}: CrudManagerProps<TItem, TFormData>) {
  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await onSubmit(value as TFormData);
      form.reset();
    },
  });

  return (
    <div className="flex flex-col gap-6 flex-1">
      <BaseForm
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-4"
      >
        {renderFormFields(form)}
        <MutationBoundary error={createMutationError} />
      </BaseForm>

      <div className="flex-1">
        <div className="flex flex-col gap-3">
          {items.map((item) => renderItem(item))}
          {!items.length && <p>{emptyMessage}</p>}
        </div>
      </div>
    </div>
  );
}
