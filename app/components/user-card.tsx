import { useState } from "react";
import { CgProfile, CgSpinner } from "react-icons/cg";
import { Link } from "react-router";
import type { Me, User } from "~/api/types/user";
import { Skeleton } from "~/components/skeleton";

export interface UserCardProps {
  user: Me | User;
  className?: string;
  showRole?: boolean;
  showRating?: boolean;
}

export function UserCard({
  user,
  className = "",
  showRating = false,
}: UserCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const sizeClasses =
    "w-6 h-6 group-[.is-md]:w-8 group-[.is-md]:h-8 group-[.is-lg]:w-16 group-[.is-lg]:h-16";

  const content = (
    <>
      <div
        className={`relative group/avatar inline-flex shrink-0 ${sizeClasses}`}
      >
        {user.picture ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <Skeleton className="absolute inset-0 rounded-sm w-full h-full" />
                <CgSpinner className="animate-spin text-gray-500 w-1/2 h-1/2 relative" />
              </div>
            )}
            <img
              src={user.picture}
              alt={user.name ?? "Anonymous"}
              onLoad={() => setImageLoaded(true)}
              className={`object-cover border border-black/20 dark:border-white/20 p-0.5 rounded-sm w-full h-full ${imageLoaded ? "" : "invisible"}`}
            />
          </>
        ) : (
          <CgProfile
            className={`text-gray-400 group-hover:transition-colors border border-black/20 dark:border-white/20 p-0.5 rounded-sm w-full h-full`}
          />
        )}
      </div>
      <div className="flex flex-col justify-center">
        <span className="font-semibold group-hover:transition-colors group-[.is-md]:text-base group-[.is-lg]:text-xl">
          {user.name ?? "Anonymous"}
        </span>
        {showRating && (
          <span className="text-gray-400 text-xs group-[.is-md]:text-sm group-[.is-lg]:text-sm">
            Rating: {user.rating}
          </span>
        )}
      </div>
    </>
  );

  return (
    <Link
      to={`/users/${user.id}`}
      className={`inline-flex items-center gap-2 hover:bg-black/5 dark:bg-white/5 p-1 rounded transition-colors group text-sm ${className}`}
    >
      {content}
    </Link>
  );
}
