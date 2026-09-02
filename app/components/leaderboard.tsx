import { Select } from "@base-ui/react";
import { useState } from "react";
import { flushSync } from "react-dom";
import { CgChevronDown, CgProfile, CgTrophy } from "react-icons/cg";
import { Link } from "react-router";
import type { LeaderboardQuery } from "~/api/types/leadeboard-query";
import { useLeaderboard } from "~/api/user";
import { Card } from "~/components/ui/card";

export function Leaderboard() {
	const [sortBy, setSortBy] = useState<LeaderboardQuery["sortBy"]>("rating");
	const { data: users, isLoading } = useLeaderboard({ sortBy });

	return (
		<Card className="bg-background/50 backdrop-blur-sm">
			<Card.Header className="flex flex-row items-center justify-between pb-4 space-y-0">
				<Card.Title className="text-lg flex items-center gap-2">
					<CgTrophy className="text-amber-500" /> Leaderboard
				</Card.Title>
				<Select.Root
					value={sortBy}
					onValueChange={(val) => {
						if (val) {
							if (document.startViewTransition) {
								document.startViewTransition(() => {
									flushSync(() => {
										setSortBy(val as LeaderboardQuery["sortBy"]);
									});
								});
							} else {
								setSortBy(val as LeaderboardQuery["sortBy"]);
							}
						}
					}}
					items={{ rating: "Top Rated", wins: "Most Wins" }}
				>
					<Select.Trigger className="system-input text-sm py-1 h-auto inline-flex items-center gap-2">
						<Select.Value />
						<Select.Icon>
							<CgChevronDown className="text-gray-500" />
						</Select.Icon>
					</Select.Trigger>
					<Select.Portal>
						<Select.Positioner sideOffset={4}>
							<Select.Popup className="system-popup outline-hidden min-w-35">
								<Select.Item
									value="rating"
									className="system-popup-item text-sm select-none"
								>
									<Select.ItemText>Top Rated</Select.ItemText>
								</Select.Item>
								<Select.Item
									value="wins"
									className="system-popup-item text-sm select-none"
								>
									<Select.ItemText>Most Wins</Select.ItemText>
								</Select.Item>
							</Select.Popup>
						</Select.Positioner>
					</Select.Portal>
				</Select.Root>
			</Card.Header>

			<Card.Content className="flex flex-col gap-3">
				{isLoading &&
					[...Array(5)].map((_, i) => (
						<div
							key={`skeleton-${i}`}
							className="transition duration-300 starting:opacity-0 starting:blur-sm flex items-center gap-3 p-2 -mx-2 rounded-lg"
						>
							<div className="w-5 shrink-0" />
							<div className="system-skeleton w-12 h-12 rounded-full shrink-0" />
							<div className="flex-1 flex flex-col justify-center gap-2">
								<div className="system-skeleton h-4 rounded w-1/2" />
								<div className="system-skeleton h-3 rounded w-1/4" />
							</div>
						</div>
					))}

				{!isLoading && !users?.length && (
					<div
						key="empty-state"
						className="text-center text-sm text-gray-500 py-4"
					>
						No users found
					</div>
				)}

				{!isLoading &&
					users?.map((user, index) => (
						<Link
							key={user.id}
							to={`/users/${user.id}`}
							style={{ viewTransitionName: `leaderboard-user-${user.id}` }}
							className="duration-300 starting:opacity-0 starting:blur-sm flex items-center gap-3 group p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors"
						>
							<div className="w-5 text-center text-sm font-bold text-gray-400 group-hover:text-foreground shrink-0 transition-colors">
								{index + 1}
							</div>

							{user.picture ? (
								<img
									src={user.picture}
									alt={user.name || "User"}
									className="w-12 h-12 rounded-full object-cover shrink-0 ring-1 ring-black/5 dark:ring-white/10"
								/>
							) : (
								<div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0 ring-1 ring-black/5 dark:ring-white/10">
									<CgProfile className="text-gray-400 text-2xl" />
								</div>
							)}

							<div className="flex-1 min-w-0 flex flex-col justify-center">
								<div className="font-medium text-sm truncate text-foreground group-hover:underline">
									{user.name || "Anonymous"}
								</div>
								<div className="text-xs text-gray-500">
									{sortBy === "rating" ? (
										<span>{Math.round(user.rating)} rating</span>
									) : (
										<span>{user.wins} wins</span>
									)}
								</div>
							</div>
						</Link>
					))}
			</Card.Content>
		</Card>
	);
}
