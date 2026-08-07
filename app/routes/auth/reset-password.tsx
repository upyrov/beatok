import { useForm } from "@tanstack/react-form";
import { type } from "arktype";
import { Link } from "react-router";
import { useResetPassword } from "~/hooks/use-auth";
import { ActionButton } from "~/components/action-button";
import { FieldError } from "~/components/field-error";
import { MutationBoundary } from "~/components/mutation-boundary";import { Input as BaseInput, Form as BaseForm } from "@base-ui/react";


export default function ResetPassword() {
  const resetPasswordMutation = useResetPassword();

  const form = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: ({ value }) => resetPasswordMutation.mutate(value.email),
  });

  return (
    <>
      {resetPasswordMutation.isSuccess ? (
        <div className="flex flex-col gap-4 text-center">
          <h2 className="text-xl font-bold">Check your email</h2>
          <p>
            If an account exists for {form.state.values.email}, we have sent
            password reset instructions.
          </p>
          <Link
            to="/signin"
            className="text-blue-500 hover:underline mt-4 block"
          >
            Return to sign in
          </Link>
        </div>
      ) : (
        <BaseForm
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <h2 className="text-xl font-bold mb-2">Reset Password</h2>
          <MutationBoundary error={resetPasswordMutation.error} />

          <form.Field
            name="email"
            validators={{
              onChange: type("string.email"),
            }}
            children={(field) => (
              <label className="flex flex-col gap-1">
                Email
                <BaseInput
                  name={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="email@beatok.xyz"
                  className="border p-2 rounded"
                />
                <FieldError errors={field.state.meta.errors} />
              </label>
            )}
          />

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <ActionButton type="submit"
                disabled={!canSubmit}
                isPending={isSubmitting || resetPasswordMutation.isPending}
              >
                Send Reset Link
              </ActionButton>
            )}
          />

          <Link
            to="/signin"
            className="text-blue-500 hover:underline mt-4 block"
          >
            Back to sign in
          </Link>
        </BaseForm>
      )}
    </>
  );
}
