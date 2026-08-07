export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-black/10 dark:bg-black/10 dark:bg-white/10 rounded-md ${className}`}
    />
  );
}
