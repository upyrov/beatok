import type { ReactNode } from "react";
import { CgSpinner } from "react-icons/cg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isPending?: boolean;
  pendingText?: ReactNode;
  children: ReactNode;
}

export function Button({
  isPending,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || isPending}
      className={`relative inline-flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center">
          <CgSpinner
            role="status"
            aria-label={"Loading..."}
            size={16}
            className="animate-spin text-gray-400"
          />
        </div>
      )}
      <span className={isPending ? "opacity-0" : ""}>{children}</span>
    </button>
  );
}
