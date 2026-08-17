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
        "flex w-full bg-input text-foreground border border-input-border shadow-input rounded-sm px-2 py-1 outline-none focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
