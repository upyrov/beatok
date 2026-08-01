import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";
import type { Category } from "./types/category/category";
import type { CreateCategory } from "./types/category/create-category";
import type { UpdateCategory } from "./types/category/update-category";

import { fetchWithAuth } from "../lib/api-client";

async function createCategory(data: CreateCategory) {
  const response = await fetchWithAuth("/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
    },
  });
}

async function getCategories(kitId: string): Promise<Category[]> {
  const response = await fetchWithAuth(`/categories?id=${kitId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export function useCategories(kitId: string) {
  return useQuery({
    queryKey: queryKeys.categories.list(kitId),
    queryFn: () => getCategories(kitId),
  });
}

async function updateCategoryName(params: {
  id: string;
  data: UpdateCategory;
}) {
  const response = await fetchWithAuth(`/categories?id=${params.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params.data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
}

export function useUpdateCategoryName() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCategoryName,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
    },
  });
}

async function deleteCategory(id: string) {
  const response = await fetchWithAuth(`/categories/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.categories.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.lists() });
    },
  });
}
