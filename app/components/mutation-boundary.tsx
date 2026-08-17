import type { UseMutationResult } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";

interface MutationBoundaryProps {
  mutation?: UseMutationResult<any, Error, any, any>;
  error?: any;
  children?: ReactNode;
}

export function MutationBoundary({
  mutation,
  error,
  children,
}: MutationBoundaryProps) {
  const activeError = error || (mutation?.isError ? mutation.error : null);

  useEffect(() => {
    if (activeError && activeError.code !== "auth/popup-closed-by-user") {
      console.error(activeError);
    }
  }, [activeError]);

  if (activeError?.code === "auth/popup-closed-by-user") {
    return <>{children}</>;
  }

  let errorMessage =
    activeError?.message ||
    "An unexpected error occurred. Please try again later.";

  if (typeof errorMessage === "string") {
    errorMessage = errorMessage
      .replace(/^Firebase:\s*/i, "")
      .replace(/\s*\(auth\/[a-z-]+\)\.?/i, "")
      .replace(
        /^Error\s*\(\s*auth\/[a-z-]+\s*\)\.?/i,
        "An authentication error occurred.",
      )
      .trim();
  }

  if (activeError?.code) {
    switch (activeError.code) {
      case "auth/invalid-email":
        errorMessage = "The email address is invalid.";
        break;
      case "auth/user-disabled":
        errorMessage = "This account has been disabled.";
        break;
      case "auth/user-not-found":
        errorMessage = "No account found with this email.";
        break;
      case "auth/wrong-password":
        errorMessage = "Incorrect password.";
        break;
      case "auth/email-already-in-use":
        errorMessage = "An account already exists with this email.";
        break;
      case "auth/weak-password":
        errorMessage = "The password is too weak.";
        break;
      case "auth/invalid-credential":
        errorMessage = "Invalid credentials provided.";
        break;
      case "auth/network-request-failed":
        errorMessage = "Network error. Please check your internet connection.";
        break;
      case "auth/too-many-requests":
        errorMessage = "Too many attempts. Please try again later.";
        break;
    }
  }

  return (
    <>
      {children}
      {activeError && (
        <div
          role="alert"
          className="relative flex flex-col items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 max-w-md w-full mt-4"
        >
          <div className="flex flex-col gap-1 pr-6">
            <h4 className="font-semibold text-sm">Error</h4>
            <p className="text-xs opacity-90 leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}
    </>
  );
}
