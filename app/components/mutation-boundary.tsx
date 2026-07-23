import type { UseMutationResult } from "@tanstack/react-query";
import type { ReactNode } from "react";

interface MutationBoundaryProps {
  mutation: UseMutationResult<any, Error, any, any>;
  children: ReactNode;
}

export function MutationBoundary({
  mutation,
  children,
}: MutationBoundaryProps) {
  return (
    <div className="flex flex-col gap-2 items-start w-full">
      {children}
      {mutation.isError && (
        <div className="bg-red-100/10 text-red-400 p-3 rounded text-sm border border-red-500/30 max-w-md w-full">
          <p className="font-semibold mb-1">Action failed</p>
          <p>{mutation.error.message}</p>
        </div>
      )}
    </div>
  );
}
