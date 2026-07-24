import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";
import type { CreateKit } from "./types/kit/create-kit";
import type { Kit } from "./types/kit/kit";
import type { UpdateKit } from "./types/kit/update-kit";

import { fetchWithAuth } from "../lib/api-client";

async function createKit(data: CreateKit) {
  const response = await fetchWithAuth("/kits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
}

export function useCreateKit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createKit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kits.lists() });
    },
  });
}

async function getKits(): Promise<Kit[]> {
  const response = await fetchWithAuth("/kits");

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export function kitsQueryOptions() {
  return {
    queryKey: queryKeys.kits.list(),
    queryFn: getKits,
  };
}

export function useKits() {
  return useQuery(kitsQueryOptions());
}

async function updateKitName(params: { id: string; data: UpdateKit }) {
  const response = await fetchWithAuth(`/kits?id=${params.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params.data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
}

export function useUpdateKitName() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateKitName,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.kits.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.kits.lists() });
    },
  });
}

async function deleteKit(id: string) {
  const response = await fetchWithAuth(`/kits/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
}

export function useDeleteKit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteKit,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.kits.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.kits.lists() });
    },
  });
}
