import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CrudApi, fetchApi } from ".";
import { ensureAnonymouslySignedIn } from "../hooks/use-auth";
import { queryKeys } from "./query-keys";
import type { CreateLobby, Lobby, LobbyFilter } from "./types/lobby";
import type { CreateScore, ScoreUpdate } from "./types/score";

export const { listQueryOptions: lobbiesQueryOptions, useList: useLobbies } =
	new CrudApi<[Lobby, LobbyFilter?], CreateLobby>(
		"/lobbies",
		queryKeys.lobbies,
		(filter?: LobbyFilter) => {
			const params = new URLSearchParams();
			if (filter) {
				Object.entries(filter).forEach(([key, value]) => {
					if (value) params.append(key, String(value));
				});
			}
			const qs = params.toString();
			return qs ? `/lobbies?${qs}` : "/lobbies";
		},
	);

export function useCreateLobby() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateLobby) => {
			await ensureAnonymouslySignedIn();
			return fetchApi<string>("/lobbies", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: queryKeys.lobbies.lists() }),
	});
}

export function useStartLobby() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) =>
			fetchApi<void>(`/lobbies/${id}/start`, { method: "PATCH" }),
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.lobbies.detail(id) });
			queryClient.invalidateQueries({ queryKey: queryKeys.lobbies.lists() });
		},
	});
}

export function useVote() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (params: { id: string; data: CreateScore }) =>
			fetchApi<string>(`/lobbies/${params.id}/scores`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(params.data),
			}),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.lobbies.detail(variables.id),
			});
		},
	});
}

export function useUpdateScore() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (params: { id: string; scoreId: string; data: ScoreUpdate }) =>
			fetchApi<void>(`/lobbies/${params.id}/scores/${params.scoreId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(params.data),
			}),
		onSuccess: (_, variables) =>
			queryClient.invalidateQueries({
				queryKey: queryKeys.lobbies.detail(variables.id),
			}),
	});
}

export function useKickParticipant() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (params: { id: string; targetUserId: string }) =>
			fetchApi<void>(
				`/lobbies/${params.id}/participants/${params.targetUserId}`,
				{
					method: "DELETE",
				},
			),
		onSuccess: (_, variables) =>
			queryClient.invalidateQueries({
				queryKey: queryKeys.lobbies.detail(variables.id),
			}),
	});
}
