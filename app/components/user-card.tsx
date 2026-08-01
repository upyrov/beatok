import { Link } from "react-router";
import type { User } from "~/api/types/user/user";
import { CgProfile } from "react-icons/cg";

export interface UserCardProps {
  user: User;
  size?: "sm" | "md" | "lg";
  className?: string;
  showRole?: boolean;
  showRating?: boolean;
  disableLink?: boolean;
}

export function UserCard({
  user,
  size = "sm",
  className = "",
  showRating = false,
  disableLink = false,
}: UserCardProps) {
  if (!user) {
    return;
  }

  const isSm = size === "sm";
  const isMd = size === "md";

  const imgSizeClass = isSm
    ? "w-6 h-6 rounded-sm"
    : isMd
      ? "w-8 h-8 rounded"
      : "w-16 h-16 rounded-lg";

  const nameSizeClass = isSm ? "" : isMd ? "text-base" : "text-xl";
  const ratingSizeClass = isSm ? "text-xs" : "text-sm";
  const containerSizeClass =
    isSm || isMd
      ? "text-sm"
      : "p-4 text-base bg-white/5 border border-white/10 w-full";

  const content = (
    <>
      <div className="relative group/avatar inline-flex">
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.name}
            className={`object-cover border border-white/20 p-0.5 ${imgSizeClass}`}
          />
        ) : (
          <CgProfile
            className={`text-gray-400 group-hover:transition-colors border border-white/20 p-0.5 ${imgSizeClass}`}
          />
        )}
      </div>
      <div className="flex flex-col justify-center">
        <span
          className={`font-semibold text-gray-200 group-hover:transition-colors ${nameSizeClass}`}
        >
          {user.name}
        </span>
        {showRating && (
          <span className={`text-gray-400 ${ratingSizeClass}`}>
            Rating: {user.rating}
          </span>
        )}
      </div>
    </>
  );

  const classes = `inline-flex items-center gap-2 hover:bg-white/5 p-1 rounded transition-colors group ${containerSizeClass} ${className}`;

  if (disableLink) {
    return <div className={classes}>{content}</div>;
  }

  return (
    <Link to={`/users/${user.id}`} className={classes}>
      {content}
    </Link>
  );
}
