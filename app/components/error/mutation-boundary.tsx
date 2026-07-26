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
    if (activeError) {
      console.error("Mutation/Form Error:", activeError);
    }
  }, [activeError]);

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
            <p className="text-xs opacity-90 leading-relaxed">
              {activeError?.message ||
                "An unexpected error occurred. Please try again later."}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
