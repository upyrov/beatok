import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "../lib/api-client";
import { queryKeys } from "./query-keys";
import type { CreateGenre } from "./types/genre/create-genre";
import type { Genre } from "./types/genre/genre";
import type { GenreUpdate } from "./types/genre/genre-update";

async function createGenre(data: CreateGenre) {
  const response = await fetchWithAuth("/genres", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
}

export function useCreateGenre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGenre,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.genres.lists() });
    },
  });
}

export async function getGenres(): Promise<Genre[]> {
  const response = await fetchWithAuth("/genres");

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export function genresQueryOptions() {
  return {
    queryKey: queryKeys.genres.list(),
    queryFn: getGenres,
  };
}

export function useGenres() {
  return useQuery(genresQueryOptions());
}

async function deleteGenre(id: string) {
  const response = await fetchWithAuth(`/genres/${id}`, { method: "DELETE" });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
}

export function useDeleteGenre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGenre,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.genres.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.genres.lists() });
    },
  });
}

async function updateGenreName(params: { id: string; data: GenreUpdate }) {
  const response = await fetchWithAuth(`/genres/${params.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params.data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
}

export function useUpdateGenreName() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateGenreName,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.genres.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.genres.lists() });
    },
  });
}
