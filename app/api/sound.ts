import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "../lib/api-client";
import { queryKeys } from "./query-keys";
import type { CreateSound } from "./types/sound/create-sound";
import type { Sound } from "./types/sound/sound";
import type { SoundUpdate } from "./types/sound/sound-update";
import type { SoundUpload } from "./types/sound/sound-upload";

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

async function getUploadUrl(
  extension: string,
  contentType: string,
): Promise<SoundUpload> {
  const response = await fetchWithAuth(
    `/sounds/upload?extension=${extension}&contentType=${encodeURIComponent(contentType)}`,
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export function useUploadSoundUrl() {
  return useMutation({
    mutationFn: ({
      extension,
      contentType,
    }: {
      extension: string;
      contentType: string;
    }) => getUploadUrl(extension, contentType),
  });
}

async function getSounds(categoryId: string): Promise<Sound[]> {
  const response = await fetchWithAuth(`/sounds?id=${categoryId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export function useSounds(categoryId: string) {
  return useQuery({
    queryKey: queryKeys.sounds.list(categoryId),
    queryFn: () => getSounds(categoryId),
  });
}

async function updateSound(params: { id: string; data: SoundUpdate }) {
  const response = await fetchWithAuth(`/sounds/${params.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params.data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
}

export function useUpdateSound() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSound,
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
