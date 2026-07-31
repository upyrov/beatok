import { Link, useNavigate } from "react-router";
import { useForm } from "@tanstack/react-form";
import { type } from "arktype";
import { useSignUp } from "~/api/auth";
import { MutationBoundary, FieldError } from "~/components/error";
import { LoadingButton } from "~/components/loading";

export default function Signup() {
  const navigate = useNavigate();
  const signUpMutation = useSignUp();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      signUpMutation.mutate(value, { onSuccess: () => navigate("/") });
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
        <MutationBoundary error={signUpMutation.error} />

        <form.Field
          name="name"
          validators={{
            onChange: type("string > 0"),
          }}
          children={(field) => (
            <label className="flex flex-col gap-1">
              Name
              <input
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="John Doe"
                className="border p-2 rounded"
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
            onChange: type("string >= 6"),
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
              isPending={isSubmitting || signUpMutation.isPending}
              className="bg-blue-600 p-2 rounded font-medium"
            >
              Sign up
            </LoadingButton>
          )}
        />
      </form>

      <Link to="/signin" className="text-blue-500 hover:underline mt-4 block">
        Already have an account?
      </Link>
    </>
  );
}
