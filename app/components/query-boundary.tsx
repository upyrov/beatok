import type { UseQueryResult } from "@tanstack/react-query";
import type { ReactNode } from "react";

interface QueryBoundaryProps<T> {
  query: UseQueryResult<T, Error>;
  children: (data: NonNullable<T>) => ReactNode;
  loadingFallback?: ReactNode;
  errorFallback?: (error: Error, retry: () => void) => ReactNode;
  emptyFallback?: ReactNode;
}

export function QueryBoundary<T>({
  query,
  children,
  loadingFallback,
  errorFallback,
  emptyFallback,
}: QueryBoundaryProps<T>) {
  if (query.isPending) {
    return loadingFallback || <div>Loading...</div>;
  }

  if (query.isError) {
    return errorFallback ? (
      errorFallback(query.error, () => query.refetch())
    ) : (
      <div className="bg-red-100 text-red-600 p-4 rounded">
        <p>Error: {query.error.message}</p>
        <button
          onClick={() => query.refetch()}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  const isEmpty =
    query.data === null ||
    query.data === undefined ||
    (Array.isArray(query.data) && query.data.length === 0);

  if (isEmpty) {
    return emptyFallback || <div>No data available.</div>;
  }

  return (
    <div className="relative">
      {/* Background refetch indicator */}
      {query.isFetching && !query.isPending && (
        <div className="absolute top-0 right-0 p-1 text-xs text-gray-500 bg-white/80 rounded-bl shadow-sm">
          Updating...
        </div>
      )}
      {children(query.data as NonNullable<T>)}
    </div>
  );
}
