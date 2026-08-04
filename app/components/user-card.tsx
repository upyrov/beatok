import { CgProfile } from "react-icons/cg";
import { Link } from "react-router";
import type { User } from "~/api/types/user/user";

export interface UserCardProps {
  user: User;
  className?: string;
  showRole?: boolean;
  showRating?: boolean;
}

export function UserCard({
  user,
  className = "",
  showRating = false,
}: UserCardProps) {
  const content = (
    <>
      <div className="relative group/avatar inline-flex">
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.name}
            className="object-cover border border-white/20 p-0.5 rounded-sm w-6 h-6 group-[.is-md]:w-8 group-[.is-md]:h-8 group-[.is-lg]:w-16 group-[.is-lg]:h-16"
          />
        ) : (
          <CgProfile
            className="text-gray-400 group-hover:transition-colors border border-white/20 p-0.5 rounded-sm w-6 h-6 group-[.is-md]:w-8 group-[.is-md]:h-8 group-[.is-lg]:w-16 group-[.is-lg]:h-16"
          />
        )}
      </div>
      <div className="flex flex-col justify-center">
        <span
          className="font-semibold text-gray-200 group-hover:transition-colors group-[.is-md]:text-base group-[.is-lg]:text-xl"
        >
          {user.name}
        </span>
        {showRating && (
          <span className="text-gray-400 text-xs group-[.is-md]:text-sm group-[.is-lg]:text-sm">
            Rating: {user.rating}
          </span>
        )}
      </div>
    </>
  );

  const classes = `inline-flex items-center gap-2 hover:bg-white/5 p-1 rounded transition-colors group text-sm ${className}`;

  return (
    <Link to={`/users/${user.id}`} className={classes}>
      {content}
    </Link>
  );
}
