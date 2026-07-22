import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";
import type { CreateLobby } from "./types/lobby/create-lobby";
import type { Lobby } from "./types/lobby/lobby";
import type { LobbyFilter } from "./types/lobby-filter";
import type { CreateScore } from "./types/score/create-score";

async function createLobby(data: CreateLobby): Promise<string> {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/lobbies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
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
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }
  const queryString = params.toString();
  const url = `${import.meta.env.VITE_API_BASE_URL}/lobbies${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url);

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

async function startLobby(id: string) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/lobbies/${id}/start`,
    {
      method: "PATCH",
      credentials: "include",
    },
  );

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

async function joinLobby(id: string) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/lobbies/${id}/participants`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
}

export function useJoinLobby() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: joinLobby,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lobbies.detail(id) });
    },
  });
}

async function leaveLobby(id: string) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/lobbies/${id}/participants/me`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
}

export function useLeaveLobby() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveLobby,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lobbies.detail(id) });
    },
  });
}

async function vote(params: { id: string; data: CreateScore }) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/lobbies/${params.id}/scores`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params.data),
      credentials: "include",
    },
  );

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
