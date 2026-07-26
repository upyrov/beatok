import type { ReactNode } from "react";
import { Spinner } from "./spinner";

export interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isPending?: boolean;
  pendingText?: ReactNode;
  children: ReactNode;
}

/**
 * A button component that automatically displays a spinning loader and pending text
 * during asynchronous or submitting states.
 */
export function LoadingButton({
  isPending,
  children,
  className = "",
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || isPending}
      className={`relative inline-flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner size="sm" />
        </div>
      )}
      <span className={isPending ? "opacity-0" : ""}>{children}</span>
    </button>
  );
}
