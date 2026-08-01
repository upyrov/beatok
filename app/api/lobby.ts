import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "../lib/api-client";
import { queryKeys } from "./query-keys";
import type { LobbyFilter } from "./types/lobby-filter";
import type { CreateLobby } from "./types/lobby/create-lobby";
import type { Lobby } from "./types/lobby/lobby";
import type { CreateScore } from "./types/score/create-score";

async function createLobby(data: CreateLobby): Promise<string> {
  const response = await fetchWithAuth("/lobbies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export function useCreateLobby() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLobby,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lobbies.lists() });
    },
  });
}

export async function getLobbies(filter?: LobbyFilter): Promise<Lobby[]> {
  const params = new URLSearchParams();
  if (filter) {
    Object.entries(filter).forEach(([key, value]) => {
      if (value) {
        params.append(key, String(value));
      }
    });
  }
  const response = await fetchWithAuth(`/lobbies?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export function lobbiesQueryOptions(filter?: LobbyFilter) {
  return {
    queryKey: queryKeys.lobbies.list(filter || {}),
    queryFn: () => getLobbies(filter),
  };
}

export function useLobbies(filter?: LobbyFilter) {
  return useQuery(lobbiesQueryOptions(filter));
}

export async function getLobbiesToRejoin(): Promise<Lobby[]> {
  const response = await fetchWithAuth("/lobbies/to-rejoin");

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export function lobbiesToRejoinQueryOptions() {
  return {
    queryKey: queryKeys.lobbies.toRejoinList(),
    queryFn: getLobbiesToRejoin,
  };
}

export function useLobbiesToRejoin() {
  return useQuery(lobbiesToRejoinQueryOptions());
}

async function startLobby(id: string) {
  const response = await fetchWithAuth(`/lobbies/${id}/start`, {
    method: "PATCH",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
}

export function useStartLobby() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startLobby,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lobbies.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.lobbies.lists() });
    },
  });
}

async function vote(params: { id: string; data: CreateScore }) {
  const response = await fetchWithAuth(`/lobbies/${params.id}/scores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params.data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
}

export function useVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vote,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.lobbies.detail(variables.id),
      });
    },
  });
}
