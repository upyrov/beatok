import { Spinner } from "./spinner";

export interface LoadingFallbackProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function LoadingFallback({
  className = "",
  size = "md",
}: LoadingFallbackProps) {
  return (
    <div
      role="status"
      className={`flex items-center justify-center p-6 ${className}`}
    >
      <Spinner size={size} className="text-gray-400" />
    </div>
  );
}
