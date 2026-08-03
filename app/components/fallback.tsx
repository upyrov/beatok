import { CgMusicNote } from "react-icons/cg";

export interface FallbackProps {
  className?: string;
  size?: string | number;
}

export function Fallback({ className = "", size = 48 }: FallbackProps) {
  return (
    <CgMusicNote
      role="status"
      aria-label={"Loading..."}
      size={size}
      className={`animate-spin border-t-white [animation-duration:1.5s] animate-ease-in-out text-gray-400 border-gray-400 border-2 rounded-full p-3 ${className}`}
    />
  );
}
