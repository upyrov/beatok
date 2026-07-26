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
  pendingText,
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
      {isPending && <Spinner size="sm" className="shrink-0" />}
      <span>{isPending ? (pendingText ?? children) : children}</span>
    </button>
  );
}
