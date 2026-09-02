import { Select } from "@base-ui/react";

import { useDeferredValue, useMemo, useState } from "react";
import { CgChevronDown, CgLogIn, CgMathPlus } from "react-icons/cg";
import { Link } from "react-router";
import { useGenres } from "~/api/genre";
import { lobbiesQueryOptions, useLobbies } from "~/api/lobby";
import type { Lobby, LobbyFilter } from "~/api/types/lobby";
import { Leaderboard } from "~/components/leaderboard";
import { LobbyCard } from "~/components/lobby-card";
import { PageContainer } from "~/components/page-container";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { getQueryClient } from "~/lib/query-client";
import type { Route } from "./+types/lobbies._index";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Beatok | Beat Battle" },
		{
			name: "description",
			content:
				"Discover and join active beat battle lobbies. Compete with others and rise to the top.",
		},
	];
}

function LobbyGridItem({ lobby }: { lobby: Lobby }) {
	return (
		<div
			style={{ viewTransitionName: `lobby-${lobby.id}` }}
			className="system-card flex flex-col p-5 hover:border-black/20 dark:hover:border-white/20 transition-all duration-300 starting:opacity-0 starting:blur-sm"
		>
			<LobbyCard lobby={lobby} />
			<div className="mt-6">
				<Link
					viewTransition
					to={`/lobbies/${lobby.id}`}
					prefetch="intent"
					className="block w-full"
				>
					<Button className="w-full flex items-center justify-center gap-2">
						<CgLogIn className="text-lg" />{" "}
						{lobby.isJoined ? "Rejoin" : "Join Lobby"}
					</Button>
				</Link>
			</div>
		</div>
	);
}

function LobbyGridSkeleton() {
	return (
		<section className="flex flex-col flex-1">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
					Active Lobbies
				</h1>
			</div>
			<div className="system-grid-list">
				{[...Array(8)].map((_, i) => (
					<div
						key={i}
						className="flex flex-col p-5 bg-muted border border-muted-border rounded-xl"
					>
						<div className="mb-6 flex items-start justify-between gap-4">
							<div className="flex flex-col gap-2">
								<div className="system-skeleton w-32 h-6" />
								<div className="system-skeleton w-24 h-4" />
							</div>
							<div className="system-skeleton w-16 h-6 rounded-lg shrink-0" />
						</div>

						<div className="flex flex-col gap-3 mt-auto">
							<div className="flex items-center justify-between">
								<div className="system-skeleton w-20 h-4" />
								<div className="system-skeleton w-24 h-4" />
							</div>
							<div className="flex items-center justify-between">
								<div className="system-skeleton w-28 h-4" />
								<div className="system-skeleton w-16 h-4" />
							</div>
							<div className="flex items-center justify-between">
								<div className="system-skeleton w-16 h-4" />
								<div className="system-skeleton w-12 h-4" />
							</div>
						</div>

						<div className="mt-6">
							<div className="system-skeleton w-full h-10 rounded-lg" />
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

export function clientLoader() {
	const queryClient = getQueryClient();
	queryClient.prefetchQuery(lobbiesQueryOptions());
	return null;
}

export default function Home() {
	const [filter, setFilter] = useState<LobbyFilter>({});
	const deferredFilter = useDeferredValue(filter);

	const lobbiesQuery = useLobbies(deferredFilter);
	const lobbies = lobbiesQuery.data ?? [];

	const genresQuery = useGenres();
	const genres = genresQuery.data ?? [];

	const { toRejoin, active } = useMemo(() => {
		return lobbies.reduce<{
			toRejoin: Lobby[];
			active: Lobby[];
		}>(
			(acc, lobby) => {
				if (lobby.isJoined) acc.toRejoin.push(lobby);
				else acc.active.push(lobby);
				return acc;
			},
			{ toRejoin: [], active: [] },
		);
	}, [lobbies]);

	return (
		<PageContainer className="max-w-7xl">
			<div className="flex flex-col lg:flex-row gap-8 items-start w-full">
				<div className="flex-1 min-w-0 flex flex-col gap-8 w-full">
					<div className="flex flex-col sm:flex-row gap-4 items-center">
						<Input
							placeholder="Search"
							value={filter.name || ""}
							onChange={(e) =>
								setFilter((f) => ({ ...f, name: e.target.value }))
							}
							className="flex-1 system-input"
						/>
						<Select.Root
							value={filter.genreId || null}
							onValueChange={(val) =>
								setFilter((f) => ({
									...f,
									genreId: val === "all" ? null : val,
								}))
							}
						>
							<Select.Trigger className="system-input flex justify-between items-center w-full sm:w-48 h-10">
								<Select.Value placeholder="All Genres">
									{(value) =>
										value && value !== "all"
											? genres.find((g) => g.id === value)?.name || "All Genres"
											: "All Genres"
									}
								</Select.Value>
								<Select.Icon>
									<CgChevronDown className="text-gray-500 dark:text-gray-400" />
								</Select.Icon>
							</Select.Trigger>
							<Select.Portal>
								<Select.Positioner sideOffset={4} alignItemWithTrigger={false}>
									<Select.Popup className="system-popup min-w-48">
										{genresQuery.isLoading ? (
											<Select.Item
												value="loading"
												disabled
												className="system-popup-item text-sm cursor-not-allowed select-none opacity-50"
											>
												<Select.ItemText>Loading...</Select.ItemText>
											</Select.Item>
										) : (
											<>
												<Select.Item
													value="all"
													className="system-popup-item text-sm select-none"
												>
													<Select.ItemText>All Genres</Select.ItemText>
												</Select.Item>
												{genres.map((genre) => (
													<Select.Item
														key={genre.id}
														value={genre.id}
														className="system-popup-item text-sm select-none"
													>
														<Select.ItemText>{genre.name}</Select.ItemText>
													</Select.Item>
												))}
											</>
										)}
									</Select.Popup>
								</Select.Positioner>
							</Select.Portal>
						</Select.Root>
						<Link viewTransition to="/lobbies/new" className="w-full sm:w-auto">
							<Button className="px-3 sm:px-5 w-full sm:w-auto shrink-0">
								<CgMathPlus className="sm:mr-2 text-lg" />{" "}
								<span className="hidden sm:inline">Create Lobby</span>
							</Button>
						</Link>
					</div>

					<div className="flex flex-col gap-8 w-full">
						{lobbiesQuery.isLoading ? (
							<LobbyGridSkeleton />
						) : (
							<div className="flex flex-col flex-1">
								<div
									className={toRejoin.length > 0 ? "flex flex-col mb-8" : ""}
								>
									{toRejoin.length > 0 && (
										<div className="flex items-center justify-between mb-6">
											<h2 className="flex items-center gap-2">
												Lobbies to Rejoin
											</h2>
										</div>
									)}
									<div className="system-grid-list">
										{toRejoin.map((lobby) => (
											<LobbyGridItem key={lobby.id} lobby={lobby} />
										))}
									</div>
								</div>

								<div
									className={active.length > 0 ? "flex flex-col flex-1" : ""}
								>
									{active.length > 0 && (
										<div className="flex items-center justify-between mb-6">
											<h2 className="flex items-center gap-2">Lobbies</h2>
										</div>
									)}
									<div className="system-grid-list">
										{active.map((lobby) => (
											<LobbyGridItem key={lobby.id} lobby={lobby} />
										))}
									</div>
								</div>
							</div>
						)}

						{!lobbiesQuery.isLoading && !active.length && !toRejoin.length && (
							<div className="transition duration-300 starting:opacity-0 starting:blur-sm flex justify-center items-center flex-col flex-1 text-center">
								<p className="text-xl font-medium">No Lobbies Found</p>
								<p className="mt-2 text-gray-500">Check back later or</p>
								<Link
									viewTransition
									to="/lobbies/new"
									prefetch="intent"
									className="mt-4 flex justify-center"
								>
									<Button className="flex items-center gap-2">
										<CgMathPlus /> Create Your Own
									</Button>
								</Link>
							</div>
						)}
					</div>
				</div>

				<aside className="w-full lg:w-80 shrink-0 sticky top-24 hidden lg:block">
					<Leaderboard />
				</aside>
			</div>
		</PageContainer>
	);
}
