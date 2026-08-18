import { cn } from "~/lib/utils";

export function Keyboard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <kbd
      className={cn(
        "px-1.5 py-0.5 text-[10px] uppercase font-semibold font-mono tracking-widest border rounded-sm",
        "text-muted-foreground bg-muted border-muted-border shadow-[inset_0_-1px_0_rgba(0,0,0,0.1)]",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
