import { useForm } from "@tanstack/react-form";
import { type } from "arktype";
import { Link, useNavigate } from "react-router";
import { useSignIn } from "~/api/auth";
import { FieldError, MutationBoundary } from "~/components/error";
import { LoadingButton } from "~/components/loading";

export default function Signin() {
  const navigate = useNavigate();
  const signInMutation = useSignIn();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      signInMutation.mutate(value, { onSuccess: () => navigate("/") });
    },
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
            <LoadingButton
              type="submit"
              disabled={!canSubmit}
              isPending={isSubmitting || signInMutation.isPending}
              className="bg-blue-600 p-2 rounded font-medium"
            >
              Sign in
            </LoadingButton>
          )}
        />
      </form>

      <Link to="/signup" className="text-blue-500 hover:underline mt-4 block">
        Don't have an account?
      </Link>
    </>
  );
}
