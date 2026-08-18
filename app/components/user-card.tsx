import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CgSpinner, CgUser } from "react-icons/cg";
import { Link } from "react-router";
import type { Me, User } from "~/api/types/user";
import { userByIdQueryOptions } from "~/api/user";

export interface UserCardProps {
  user: Me | User;
  className?: string;
  showRole?: boolean;
  showRating?: boolean;
  direction?: "horizontal" | "vertical";
  hideNameOnMobile?: boolean;
}

export function UserCard({
  user,
  className = "",
  showRating = false,
  direction = "horizontal",
  hideNameOnMobile = false,
}: UserCardProps) {
  const queryClient = useQueryClient();
  const prefetch = () => {
    queryClient.prefetchQuery(userByIdQueryOptions(user.id));
  };
  const [imageLoaded, setImageLoaded] = useState(false);

  const sizeClasses =
    "w-6 h-6 group-[.is-md]:w-8 group-[.is-md]:h-8 group-[.is-lg]:w-12 group-[.is-lg]:h-12 group-[.is-xl]:w-16 group-[.is-xl]:h-16";

  const content = (
    <>
      <div
        className={`relative group/avatar inline-flex shrink-0 ${sizeClasses}`}
      >
        {user.picture ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="system-skeleton absolute inset-0 rounded-sm w-full h-full" />
                <CgSpinner
                  role="status"
                  aria-label={"Loading..."}
                  className="animate-spin text-gray-500 w-1/2 h-1/2 relative"
                />
              </div>
            )}
            <img
              src={user.picture}
              alt={user.name || "Anonymous"}
              onLoad={() => setImageLoaded(true)}
              className={`object-cover border border-black/20 dark:border-white/20 p-0.5 rounded-sm w-full h-full ${imageLoaded ? "" : "invisible"}`}
            />
          </>
        ) : (
          <CgUser
            className={`text-gray-400 group-hover:transition-colors border border-black/20 dark:border-white/20 p-0.5 rounded-sm w-full h-full`}
          />
        )}
      </div>
      <div
        className={`flex flex-col justify-center ${hideNameOnMobile ? "hidden sm:flex" : ""}`}
      >
        <span className="font-semibold group-hover:transition-colors group-[.is-md]:text-base group-[.is-lg]:text-lg group-[.is-xl]:text-xl">
          {user.name || "Anonymous"}
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
      viewTransition
      to={`/users/${user.id}`}
      onMouseEnter={prefetch}
      onFocus={prefetch}
      className={`inline-flex ${direction === "vertical" ? "flex-col" : ""} items-center ${direction === "vertical" ? "gap-1" : "gap-2"} hover:bg-muted p-1 rounded transition-colors group text-sm ${className}`}
    >
      {content}
    </Link>
  );
}
