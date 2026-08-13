import { Form as BaseForm, Input as BaseInput, Button } from "@base-ui/react";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { type } from "arktype";
import { useState } from "react";
import { CgGoogle } from "react-icons/cg";
import { Link, useNavigate } from "react-router";
import { queryKeys } from "~/api/query-keys";
import { ActionButton } from "~/components/action-button";
import { FieldError } from "~/components/field-error";
import { MutationBoundary } from "~/components/mutation-boundary";
import {
  signInWithGoogle,
  useResetPassword,
  useSignIn,
} from "~/hooks/use-auth";
import type { Route } from "./+types/signin";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Beatok | Signin" },
    {
      name: "description",
      content: "Sign in to your Beatok account to join beat battles.",
    },
  ];
}

export default function Signin() {
  const navigate = useNavigate();
  const signInMutation = useSignIn();
  const queryClient = useQueryClient();
  const [isGooglePending, setIsGooglePending] = useState(false);
  const [googleError, setGoogleError] = useState<Error | null>(null);
  const resetPasswordMutation = useResetPassword();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      if (signInMutation.isPending) return;
      try {
        await signInMutation.mutateAsync(value);
        navigate("/");
      } catch {}
    },
  });

  return (
    <div className="system-panel p-8 w-full max-w-sm flex flex-col transition duration-300 starting:opacity-0 starting:translate-y-1">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
        Sign In
      </h1>
      <BaseForm
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-4"
      >
        <MutationBoundary error={signInMutation.error} />
        <MutationBoundary error={googleError} />

        <form.Field
          name="email"
          validators={{
            onChange: type("string.email"),
          }}
          children={(field) => (
            <label className="flex flex-col gap-1 font-medium text-sm text-gray-700 dark:text-gray-300">
              Email
              <BaseInput
                id="password"
                name={field.name}
                type="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="email@beatok.xyz"
                className="system-input w-full mt-1 font-normal"
              />
              <FieldError errors={field.state.meta.errors} />
            </label>
          )}
        />

        <form.Field
          name="password"
          validators={{
            onChange: type("string > 0"),
          }}
          children={(field) => (
            <label className="flex flex-col gap-1 font-medium text-sm text-gray-700 dark:text-gray-300">
              Password
              <BaseInput
                id={field.name}
                name={field.name}
                type="password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Secret123!"
                className="system-input w-full mt-1 font-normal"
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
              pending={isSubmitting || signInMutation.isPending}
            >
              Sign In
            </ActionButton>
          )}
        />
      </BaseForm>

      <div className="my-6 flex items-center justify-between opacity-60">
        <hr className="w-full border-gray-300 dark:border-gray-600" />
        <span className="p-2 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
          or
        </span>
        <hr className="w-full border-gray-300 dark:border-gray-600" />
      </div>

      <ActionButton
        type="button"
        onClick={async () => {
          try {
            setIsGooglePending(true);
            setGoogleError(null);
            await signInWithGoogle();
            await queryClient.invalidateQueries({
              queryKey: queryKeys.users.me(),
            });
            navigate("/");
          } catch (error: any) {
            setGoogleError(error);
          } finally {
            setIsGooglePending(false);
          }
        }}
        pending={isGooglePending}
      >
        <CgGoogle className="mr-2" size={18} /> Continue with Google
      </ActionButton>

      <div className="mt-6 flex flex-col gap-2 items-center text-sm">
        <Link
          viewTransition
          to="/signup"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Don't have an account? Sign up
        </Link>
        <Button
          type="button"
          onClick={() => {
            const email = form.state.values.email;
            if (email && email.includes("@")) {
              resetPasswordMutation.mutate(email);
            } else {
              navigate("/password-reset");
            }
          }}
          className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Forgot password?
        </Button>
        {resetPasswordMutation.isSuccess && (
          <p className="text-green-500 mt-2 text-xs text-center">
            Password reset link sent to {form.state.values.email}!
          </p>
        )}
      </div>
    </div>
  );
}
