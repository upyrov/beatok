import { Button as BaseButton } from "@base-ui/react";
import type { ReactNode } from "react";

export interface ButtonProps extends React.ComponentProps<typeof BaseButton> {
  children: ReactNode;
  className?: string;
}

export function Button({ children, className = "", ...props }: ButtonProps) {
  return (
    <BaseButton
      {...props}
      className={`px-4 h-9 bg-linear-to-b from-[#4a4a4a] via-[#2a2a2a] to-[#1a1a1a] hover:from-[#5a5a5a] hover:via-[#3a3a3a] hover:to-[#2a2a2a] active:from-[#1a1a1a] active:via-[#1a1a1a] active:to-[#1a1a1a] border border-black/80 rounded-md text-[#e0e4e8] text-[13px] font-medium flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_2px_4px_rgba(0,0,0,0.8)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] transition duration-100 ${className}`}
    >
      {children}
    </BaseButton>
  );
}
