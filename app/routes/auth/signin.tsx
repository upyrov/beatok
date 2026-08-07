import {
  Button as BaseButton,
  Form as BaseForm,
  Input as BaseInput,
} from "@base-ui/react";
import { useForm } from "@tanstack/react-form";
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

import { type } from "arktype";
import { CgGoogle } from "react-icons/cg";
import { Link, useNavigate } from "react-router";
import { ActionButton } from "~/components/action-button";
import { FieldError } from "~/components/field-error";
import { MutationBoundary } from "~/components/mutation-boundary";
import {
  useResetPassword,
  useSignIn,
  useSignInWithGoogle,
} from "~/hooks/use-auth";

export default function Signin() {
  const navigate = useNavigate();
  const signInMutation = useSignIn();
  const signInWithGoogleMutation = useSignInWithGoogle();
  const resetPasswordMutation = useResetPassword();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: ({ value }) =>
      signInMutation.mutate(value, { onSuccess: () => navigate("/") }),
  });

  return (
    <>
      <BaseForm
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-4"
      >
        <MutationBoundary error={signInMutation.error} />
        <MutationBoundary error={signInWithGoogleMutation.error} />

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

        <form.Field
          name="password"
          validators={{
            onChange: type("string > 0"),
          }}
          children={(field) => (
            <label className="flex flex-col gap-1">
              Password
              <BaseInput
                name={field.name}
                type="password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Secret123!"
                className="border p-2 rounded"
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
              isPending={isSubmitting || signInMutation.isPending}
            >
              Sign in
            </ActionButton>
          )}
        />
      </BaseForm>

      <div className="my-4 flex items-center justify-between">
        <hr className="w-full border-gray-300" />
        <span className="p-2 text-gray-400">or</span>
        <hr className="w-full border-gray-300" />
      </div>

      <ActionButton
        type="button"
        onClick={() =>
          signInWithGoogleMutation.mutate(undefined, {
            onSuccess: () => navigate("/"),
          })
        }
        isPending={signInWithGoogleMutation.isPending}
      >
        <CgGoogle /> Continue with Google
      </ActionButton>

      <Link to="/signup" className="text-blue-500 hover:underline mt-4 block">
        Don't have an account?
      </Link>
      <BaseButton
        type="button"
        onClick={() => {
          const email = form.state.values.email;
          if (email && email.includes("@")) {
            resetPasswordMutation.mutate(email);
          } else {
            navigate("/password-reset");
          }
        }}
        className="text-blue-500 hover:underline mt-2 block text-left"
      >
        Forgot password?
      </BaseButton>
      {resetPasswordMutation.isSuccess && (
        <p className="text-green-500 mt-2 text-sm">
          Password reset link sent to {form.state.values.email}!
        </p>
      )}
    </>
  );
}
