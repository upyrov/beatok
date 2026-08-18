import { Input as BaseInput } from "@base-ui/react";
import * as React from "react";
import { cn } from "~/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof BaseInput>
>(({ className, type, ...props }, ref) => {
  return (
    <BaseInput
      type={type}
      className={cn(
        "system-input flex w-full disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
