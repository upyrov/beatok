import { Form as BaseForm, Input as BaseInput } from "@base-ui/react";
import { useForm } from "@tanstack/react-form";
import { type } from "arktype";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ActionButton } from "~/components/action-button";
import { FieldError } from "~/components/field-error";
import { MutationBoundary } from "~/components/mutation-boundary";
import { useConfirmPasswordReset, useVerifyEmail } from "~/hooks/use-auth";

export default function Action() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");
  const navigate = useNavigate();
  const confirmPasswordResetMutation = useConfirmPasswordReset();
  const verifyEmailMutation = useVerifyEmail();
  const [verificationStatus, setVerificationStatus] = useState<
    "pending" | "success" | "error"
  >("pending");

  useEffect(() => {
    if (mode === "verifyEmail" && oobCode && verificationStatus === "pending") {
      verifyEmailMutation.mutate(oobCode, {
        onSuccess: () => setVerificationStatus("success"),
        onError: () => setVerificationStatus("error"),
      });
    }
  }, [mode, oobCode, verifyEmailMutation, verificationStatus]);

  const form = useForm({
    defaultValues: {
      password: "",
    },
    onSubmit: ({ value }) => {
      if (!oobCode) return;
      confirmPasswordResetMutation.mutate(
        { code: oobCode, password: value.password },
        {
          onSuccess: () => {
            navigate("/signin");
          },
        },
      );
    },
  });

  if (!oobCode || (mode !== "resetPassword" && mode !== "verifyEmail")) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h2 className="text-xl font-bold text-red-500">Invalid Request</h2>
        <p>The link is invalid or has expired.</p>
        <Link to="/signin" className="text-blue-500 hover:underline mt-4 block">
          Go back to sign in
        </Link>
      </div>
    );
  }

  if (mode === "verifyEmail") {
    return (
      <div className="flex flex-col gap-4 text-center">
        {verificationStatus === "pending" && (
          <>
            <h2 className="text-xl font-bold mb-2">Verifying Email...</h2>
            <p>Please wait while we verify your email address.</p>
          </>
        )}
        {verificationStatus === "success" && (
          <>
            <h2 className="text-xl font-bold text-green-500 mb-2">
              Email Verified!
            </h2>
            <p>Your email address has been successfully verified.</p>
            <Link
              to="/signin"
              className="text-blue-500 hover:underline mt-4 block"
            >
              Continue to sign in
            </Link>
          </>
        )}
        {verificationStatus === "error" && (
          <>
            <h2 className="text-xl font-bold text-red-500 mb-2">
              Verification Failed
            </h2>
            <p>The verification link is invalid or has expired.</p>
            <Link
              to="/signin"
              className="text-blue-500 hover:underline mt-4 block"
            >
              Go back to sign in
            </Link>
          </>
        )}
      </div>
    );
  }

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
        <h2 className="text-xl font-bold mb-2">Create New Password</h2>
        <MutationBoundary error={confirmPasswordResetMutation.error} />

        <form.Field
          name="password"
          validators={{
            onChange: type("string > 0"),
          }}
          children={(field) => (
            <label className="flex flex-col gap-1">
              New Password
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
              isPending={isSubmitting || confirmPasswordResetMutation.isPending}
            >
              Reset Password
            </ActionButton>
          )}
        />
      </BaseForm>
    </>
  );
}
