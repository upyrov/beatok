import { Button } from "@base-ui/react";
import type { ReactNode } from "react";
import { CgSpinner } from "react-icons/cg";

export interface ActionButtonProps extends React.ComponentProps<typeof Button> {
  pending?: boolean;
  children?: ReactNode;
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
      className={`system-button relative ${className}`}
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
