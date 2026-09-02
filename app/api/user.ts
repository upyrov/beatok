import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from ".";
import { queryKeys } from "./query-keys";
import type { Comment, CreateComment } from "./types/comment";
import type { LeaderboardQuery } from "./types/leadeboard-query";
import type { ArchivedLobby } from "./types/lobby";
import type { PageResult } from "./types/page-result";
import type {
	LeaderboardUser,
	Me,
	PictureUpload,
	Profile,
	UserUpdate,
} from "./types/user";

export const useLeaderboard = (query: LeaderboardQuery) =>
	useQuery({
		queryKey: queryKeys.leaderboard(query.sortBy),
		queryFn: () => {
			const params = new URLSearchParams({ ...query } as any);
			return fetchApi<LeaderboardUser[]>(`/leaderboard?${params}`);
		},
	});

export const userQueryOptions = () => ({
	queryKey: queryKeys.users.me(),
	queryFn: (): Promise<Me> => fetchApi<Me>("/users/me"),
	retry: (_: number, error: Error) => error.message !== "Unauthorized",
	staleTime: Infinity,
	refetchOnMount: false,
	refetchOnWindowFocus: false,
	meta: {
		hasErrorMessage: false,
	},
});

export const useUser = () => useQuery(userQueryOptions());

function getUserById(id: string, year?: number): Promise<Profile> {
	const query = year
		? `?${new URLSearchParams({ year: year.toString() }).toString()}`
		: "";
	return fetchApi<Profile>(`/users/${id}${query}`);
}

export const userByIdQueryOptions = (id: string, year?: number) => ({
	queryKey: [...queryKeys.users.detail(id), year].filter(Boolean),
	queryFn: () => getUserById(id, year),
});

export const useUserById = (id: string, year?: number) =>
	useQuery(userByIdQueryOptions(id, year));

export function useAddComment(userId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateComment) =>
			fetchApi<void>(`/users/${userId}/comments`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.users.detail(userId),
			});
		},
	});
}

function getComments(userId: string, page = 1, pageSize = 25) {
	const params = new URLSearchParams();
	params.append("page", page.toString());
	params.append("pageSize", pageSize.toString());

	const queryString = params.toString() ? `?${params.toString()}` : "";
	return fetchApi<PageResult<Comment>>(
		`/users/${userId}/comments${queryString}`,
	);
}

export const commentsQueryOptions = (
	userId: string,
	page = 1,
	pageSize = 25,
) => ({
	queryKey: queryKeys.users.comments(userId, page, pageSize),
	queryFn: () => getComments(userId, page, pageSize),
});

export const useComments = (userId: string, page = 1, pageSize = 25) =>
	useQuery(commentsQueryOptions(userId, page, pageSize));

export function useUploadAvatarUrl() {
	return useMutation({
		mutationFn: (data: { extension: string; contentType: string }) => {
			const params = new URLSearchParams();
			params.append("extension", data.extension);
			params.append("contentType", data.contentType);
			return fetchApi<PictureUpload>(`/users/upload?${params.toString()}`);
		},
	});
}

export function useUpdateUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UserUpdate) =>
			fetchApi<void>("/users", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			}),
		onSuccess: () =>
			queryClient.invalidateQueries({
				queryKey: queryKeys.users.me(),
			}),
	});
}

function getActivity(userId: string, date: string) {
	const params = new URLSearchParams();
	params.append("date", date);
	return fetchApi<ArchivedLobby[]>(
		`/users/${userId}/activity?${params.toString()}`,
	);
}

export const useActivity = (id: string, date: string) =>
	useQuery({
		queryKey: queryKeys.users.activity(id, date),
		queryFn: () => getActivity(id, date),
	});
