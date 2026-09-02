import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
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
	badges?: React.ReactNode;
}

export function UserCard({
	user,
	className = "",
	showRating = false,
	direction = "horizontal",
	hideNameOnMobile = false,
	badges,
}: UserCardProps) {
	const queryClient = useQueryClient();
	const prefetch = useCallback(() => {
		queryClient.prefetchQuery(userByIdQueryOptions(user.id));
	}, [queryClient, user.id]);
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
								<div className="system-skeleton absolute inset-0 rounded-full w-full h-full" />
								<CgSpinner
									role="status"
									aria-label={"Loading..."}
									className="animate-spin text-gray-500 w-1/2 h-1/2 relative"
								/>
							</div>
						)}
						<img
							src={user.picture.url}
							alt={user.name || "Anonymous"}
							onLoad={() => setImageLoaded(true)}
							className={`object-cover rounded-full ring-1 ring-black/5 dark:ring-white/10 w-full h-full ${imageLoaded ? "" : "invisible"}`}
						/>
					</>
				) : (
					<div className="w-full h-full rounded-full bg-muted flex items-center justify-center shrink-0 ring-1 ring-black/5 dark:ring-white/10">
						<CgUser className="text-gray-400 text-lg group-[.is-md]:text-xl group-[.is-lg]:text-3xl group-[.is-xl]:text-4xl" />
					</div>
				)}
			</div>
			<div
				className={`flex flex-col justify-center flex-1 min-w-0 ${hideNameOnMobile ? "hidden sm:flex" : ""}`}
			>
				<div className="flex items-center gap-2 w-full">
					<span className="font-semibold truncate group-hover:transition-colors group-[.is-md]:text-base group-[.is-lg]:text-lg group-[.is-xl]:text-xl">
						{user.name || "Anonymous"}
					</span>
					{badges && (
						<div className="flex items-center gap-1 ml-auto">{badges}</div>
					)}
				</div>
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
