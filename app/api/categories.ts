import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";
import type { CreateCategory } from "./types/category/create-category";
import type { UpdateCategory } from "./types/category/update-category";

async function createCategory(data: CreateCategory) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/categories`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );

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

async function updateCategoryName(params: {
  id: string;
  data: UpdateCategory;
}) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/categories?id=${params.id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params.data),
    },
  );

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
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/categories/${id}`,
    {
      method: "DELETE",
    },
  );

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
