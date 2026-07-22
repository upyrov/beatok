import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";
import type { CreateKit } from "./types/kit/create-kit";
import type { Kit } from "./types/kit/kit";
import type { UpdateKit } from "./types/kit/update-kit";

async function createKit(data: CreateKit) {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/kits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
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
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/kits`, {
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export function useKits() {
  return useQuery({
    queryKey: queryKeys.kits.list(),
    queryFn: getKits,
  });
}

async function updateKitName(params: { id: string; data: UpdateKit }) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/kits?id=${params.id}`,
    {
      method: "PUT",
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
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/kits/${id}`,
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
