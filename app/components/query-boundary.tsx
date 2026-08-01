import type { UseQueryResult } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { Fallback } from "./fallback";

interface QueryBoundaryProps<T> {
  query: UseQueryResult<T, Error>;
  children: (data: NonNullable<T>) => ReactNode;
}

export function QueryBoundary<T>({ query, children }: QueryBoundaryProps<T>) {
  useEffect(() => {
    if (query.isError) {
      console.error("QueryError:", query.error);
    }
  }, [query.isError, query.error]);

  if (query.isPending) {
    return <Fallback />;
  }

  if (query.isError) {
    return (
      <div
        role="alert"
        className="flex flex-col items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 max-w-md w-full"
      >
        <div className="flex flex-col gap-1">
          <h4 className="font-semibold text-sm">Something went wrong</h4>
          <p className="text-xs opacity-90 leading-relaxed">
            An unexpected error occurred.
          </p>
        </div>
        <button
          type="button"
          onClick={() => query.refetch()}
          className="text-xs bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!query.data) {
    return <span>No data available.</span>;
  }

  return (
    <div className="relative">
      {/* Background refetch indicator */}
      {query.isFetching && !query.isPending && <Fallback />}
      {children(query.data)}
    </div>
  );
}
