import { Form as BaseForm, Input as BaseInput } from "@base-ui/react";
import { useForm } from "@tanstack/react-form";
import { type } from "arktype";
import { Link } from "react-router";
import { ActionButton } from "~/components/action-button";
import { FieldError } from "~/components/field-error";
import { MutationBoundary } from "~/components/mutation-boundary";
import { useResetPassword } from "~/hooks/use-auth";
import type { Route } from "./+types/_auth.password-reset";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Beatok | Password Reset" },
    { name: "description", content: "Reset your Beatok account password." },
  ];
}

export default function PasswordReset() {
  const resetPasswordMutation = useResetPassword();

  const form = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      if (resetPasswordMutation.isPending) return;
      try {
        await resetPasswordMutation.mutateAsync(value.email);
      } catch {}
    },
  });

  return (
    <div className="system-panel p-8 w-full max-w-sm flex flex-col transition duration-300 starting:opacity-0 starting:translate-y-1">
      {resetPasswordMutation.isSuccess ? (
        <div className="flex flex-col gap-4 text-center">
          <h2 className="text-xl font-bold">Check your email</h2>
          <p>
            If an account exists for {form.state.values.email}, we have sent
            password reset instructions.
          </p>
          <Link
            viewTransition
            to="/signin"
            className="text-blue-600 dark:text-blue-400 hover:underline mt-4 block"
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
          <h2 className="text-2xl font-bold mb-2 text-center text-gray-900 dark:text-white">
            Reset Password
          </h2>
          <MutationBoundary error={resetPasswordMutation.error} />

          <form.Field
            name="email"
            validators={{
              onChange: type("string.email"),
            }}
            children={(field) => (
              <label className="flex flex-col gap-1 font-medium text-sm text-gray-700 dark:text-gray-300">
                Email
                <BaseInput
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="email@beatok.xyz"
                  className="w-full mt-1 font-normal system-input"
                />
                <FieldError errors={field.state.meta.errors} />
              </label>
            )}
          />

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <ActionButton
                type="submit"
                disabled={!canSubmit}
                pending={isSubmitting || resetPasswordMutation.isPending}
              >
                Send Reset Link
              </ActionButton>
            )}
          />

          <div className="mt-6 flex justify-center text-sm">
            <Link
              viewTransition
              to="/signin"
              className="text-blue-600 dark:text-blue-400 hover:underline block"
            >
              Back to sign in
            </Link>
          </div>
        </BaseForm>
      )}
    </div>
  );
}
