import { Form as BaseForm } from "@base-ui/react";
import { useForm } from "@tanstack/react-form";
import { type } from "arktype";
import { useAddComment } from "~/api/user";
import { ActionButton } from "../action-button";

export function CommentForm({ userId }: { userId: string }) {
  const addComment = useAddComment(userId);

  const form = useForm({
    defaultValues: {
      content: "",
    },
    onSubmit: async ({ value }) => {
      try {
        await addComment.mutateAsync({ userId, data: value });
        form.reset();
      } catch (error) {
        console.error(error);
      }
    },
  });

  return (
    <BaseForm
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="mb-8 flex flex-col gap-2"
    >
      <form.Field
        name="content"
        validators={{
          onChange: type("string > 0"),
        }}
        children={(field) => (
          <textarea
            name={field.name}
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            placeholder="Leave a comment..."
            className="w-full bg-black/10 dark:bg-white/10 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-25"
          />
        )}
      />
      <div className="flex justify-end">
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <ActionButton
              type="submit"
              disabled={!canSubmit || isSubmitting || addComment.isPending}
            >
              Post Comment
            </ActionButton>
          )}
        />
      </div>
    </BaseForm>
  );
}
