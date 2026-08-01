import { CgSpinner } from "react-icons/cg";

export interface FallbackProps {
  className?: string;
  size?: string | number;
}

export function Fallback({ className = "", size = 24 }: FallbackProps) {
  return (
    <div
      role="status"
      className={`flex items-center justify-center p-6 ${className}`}
    >
      <CgSpinner
        role="status"
        aria-label={"Loading..."}
        size={size}
        className="animate-spin text-gray-400"
      />
    </div>
  );
}
