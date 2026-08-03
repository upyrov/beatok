import type { ReactNode } from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
}

export function Button({ children, className = "", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`px-4 py-1.5 h-auto min-h-7 bg-linear-to-b from-[#5c656d] to-[#495158] hover:from-[#656e76] hover:to-[#515961] active:from-[#434a51] active:to-[#3e444a] border border-[#2b3035] rounded text-[#e0e4e8] text-[13px] font-medium flex items-center justify-center cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,0.3)] active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)] transition-colors duration-100 ${className}`}
    >
      {children}
    </button>
  );
}
