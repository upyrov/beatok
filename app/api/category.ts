import { CrudApi } from ".";
import { queryKeys } from "./query-keys";
import type {
  Category,
  CategoryUpdate,
  CreateCategory,
} from "./types/category";

export const {
  useList: useCategories,
  useCreate: useCreateCategory,
  useUpdate: useUpdateCategory,
  useDelete: useDeleteCategory,
} = new CrudApi<Category, CreateCategory, CategoryUpdate, [string]>(
  "/categories",
  queryKeys.categories,
  (kitId: string) =>
    `/categories?${new URLSearchParams({ id: kitId }).toString()}`,
);
