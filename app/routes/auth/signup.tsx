import { Form as BaseForm, Input as BaseInput } from "@base-ui/react";
import { useForm } from "@tanstack/react-form";
import { type } from "arktype";
import { CgGoogle } from "react-icons/cg";
import { Link, useNavigate } from "react-router";
import { ActionButton } from "~/components/action-button";
import { FieldError } from "~/components/field-error";
import { MutationBoundary } from "~/components/mutation-boundary";
import { useSignInWithGoogle, useSignUp } from "~/hooks/use-auth";
import type { Route } from "./+types/signup";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Beatok | Signup" },
    {
      name: "description",
      content: "Create a Beatok account and start competing in beat battles.",
    },
  ];
}

export default function Signup() {
  const navigate = useNavigate();
  const signUpMutation = useSignUp();
  const signInWithGoogleMutation = useSignInWithGoogle();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      if (signUpMutation.isPending) return;
      await signUpMutation.mutateAsync(value, {
        onSuccess: () => navigate("/"),
      });
    },
  });

  return (
    <div className="system-panel p-8 w-full max-w-sm flex flex-col transition duration-300 starting:opacity-0 starting:translate-y-1">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
        Sign Up
      </h1>
      <BaseForm
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-4"
      >
        <MutationBoundary error={signUpMutation.error} />
        <MutationBoundary error={signInWithGoogleMutation.error} />

        <form.Field
          name="name"
          validators={{
            onChange: type("string > 0"),
          }}
          children={(field) => (
            <label className="flex flex-col gap-1 font-medium text-sm text-gray-700 dark:text-gray-300">
              Name
              <BaseInput
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="John Doe"
                className="system-input w-full mt-1 font-normal"
              />
              <FieldError errors={field.state.meta.errors} />
            </label>
          )}
        />

        <form.Field
          name="email"
          validators={{
            onChange: type("string.email"),
          }}
          children={(field) => (
            <label className="flex flex-col gap-1 font-medium text-sm text-gray-700 dark:text-gray-300">
              Email
              <BaseInput
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
            onChange: type("string >= 6"),
          }}
          children={(field) => (
            <label className="flex flex-col gap-1 font-medium text-sm text-gray-700 dark:text-gray-300">
              Password
              <BaseInput
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
              pending={isSubmitting || signUpMutation.isPending}
            >
              Sign Up
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
        onClick={() =>
          signInWithGoogleMutation.mutate(undefined, {
            onSuccess: () => navigate("/"),
          })
        }
        pending={signInWithGoogleMutation.isPending}
      >
        <CgGoogle className="mr-2" size={18} /> Continue with Google
      </ActionButton>

      <div className="mt-6 flex justify-center text-sm">
        <Link
          viewTransition
          to="/signin"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  );
}
