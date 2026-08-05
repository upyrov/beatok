import { useForm } from "@tanstack/react-form";
import { type } from "arktype";
import { CgGoogle } from "react-icons/cg";
import { Link, useNavigate } from "react-router";
import { useGoogleAuthUrl, useSignIn } from "~/api/auth";
import { ActionButton } from "~/components/action-button";
import { FieldError } from "~/components/field-error";
import { MutationBoundary } from "~/components/mutation-boundary";

export default function Signin() {
  const navigate = useNavigate();
  const signInMutation = useSignIn();
  const googleAuthUrlMutation = useGoogleAuthUrl();

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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-4"
      >
        <MutationBoundary error={signInMutation.error} />
        <MutationBoundary error={googleAuthUrlMutation.error} />

        <form.Field
          name="email"
          validators={{
            onChange: type("string.email"),
          }}
          children={(field) => (
            <label className="flex flex-col gap-1">
              Email
              <input
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
              <input
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
              disabled={!canSubmit}
              isPending={isSubmitting || signInMutation.isPending}
            >
              Sign in
            </ActionButton>
          )}
        />
      </form>

      <div className="my-4 flex items-center justify-between">
        <hr className="w-full border-gray-300" />
        <span className="p-2 text-gray-400">or</span>
        <hr className="w-full border-gray-300" />
      </div>

      <ActionButton
        type="button"
        onClick={() => googleAuthUrlMutation.mutate()}
        isPending={googleAuthUrlMutation.isPending}
      >
        <CgGoogle /> Continue with Google
      </ActionButton>

      <Link to="/signup" className="text-blue-500 hover:underline mt-4 block">
        Don't have an account?
      </Link>
    </>
  );
}
