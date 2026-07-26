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
  const borderWidth = Math.max(2, Math.floor(pixelSize / 10));

  return (
    <div
      role="status"
      aria-label={label}
      className={`animate-spin inline-block rounded-full border-current border-r-transparent ${className}`}
      style={{
        width: pixelSize,
        height: pixelSize,
        borderWidth,
      }}
    />
  );
}
