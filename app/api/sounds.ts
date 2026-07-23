import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";
import type { CreateSound } from "./types/sound/create-sound";
import type { UpdateSound } from "./types/sound/update-sound";
import { fetchWithAuth } from "../lib/api-client";

async function createSound(data: CreateSound) {
  const response = await fetchWithAuth("/sounds", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
}

export function useCreateSound() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSound,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sounds.lists() });
    },
  });
}

async function updateSoundValue(params: { id: string; data: UpdateSound }) {
  const response = await fetchWithAuth(`/sounds?id=${params.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params.data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
}

export function useUpdateSoundValue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSoundValue,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.sounds.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.sounds.lists() });
    },
  });
}

async function deleteSound(id: string) {
  const response = await fetchWithAuth(`/sounds/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
}

export function useDeleteSound() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSound,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sounds.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.sounds.lists() });
    },
  });
}
