import { CgSpinner } from "react-icons/cg";
import { Button, type ButtonProps } from "./button";

export interface ActionButtonProps extends ButtonProps {
  pending?: boolean;
}

export function ActionButton({
  children,
  pending,
  disabled,
  className = "",
  ...props
}: ActionButtonProps) {
  return (
    <Button
      {...props}
      disabled={disabled || pending}
      className={`relative inline-flex items-center justify-center gap-2 transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {pending && (
        <div className="absolute inset-0 flex items-center justify-center">
          <CgSpinner
            role="status"
            aria-label={"Loading..."}
            size={16}
            className="animate-spin text-gray-400"
          />
        </div>
      )}
      <span
        className={`inline-flex items-center justify-center gap-2 ${pending ? "opacity-0" : ""}`}
      >
        {children}
      </span>
    </Button>
  );
}
