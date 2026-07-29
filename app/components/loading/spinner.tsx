import { CgSpinner } from "react-icons/cg";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl" | number;
  className?: string;
  label?: string;
}

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 36,
  xl: 48,
};

export function Spinner({
  size = "md",
  className = "",
  label = "Loading",
}: SpinnerProps) {
  const pixelSize = typeof size === "number" ? size : sizeMap[size];

  return (
    <CgSpinner
      role="status"
      aria-label={label}
      size={pixelSize}
      className={`animate-spin ${className}`}
    />
  );
}
