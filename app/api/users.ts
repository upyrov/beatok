import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "../lib/api-client";
import { queryKeys } from "./query-keys";
import type { Comment } from "./types/comment/comment";
import type { CreateComment } from "./types/comment/create-comment";
import type { PageResult } from "./types/page-result";
import type { Me } from "./types/user/me";
import type { PictureUpload } from "./types/user/picture-upload";
import type { User } from "./types/user/user";
import type { UserUpdate } from "./types/user/user-update";

async function getUser(): Promise<Me> {
  const response = await fetchWithAuth("/users/me");

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export function userQueryOptions() {
  return {
    queryKey: queryKeys.users.me(),
    queryFn: getUser,
  };
}

export function useUser() {
  return useQuery(userQueryOptions());
}

async function getUserById(id: string): Promise<User> {
  const response = await fetchWithAuth(`/users/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export function userByIdQueryOptions(id: string) {
  return {
    queryKey: queryKeys.users.detail(id),
    queryFn: () => getUserById(id),
  };
}

export function useUserById(id: string) {
  return useQuery(userByIdQueryOptions(id));
}

async function addComment(params: { userId: string; data: CreateComment }) {
  const response = await fetchWithAuth(`/users/${params.userId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params.data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
}

export function useAddComment(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addComment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(userId),
      });
    },
  });
}

async function getComments(
  userId: string,
  page = 1,
  pageSize = 25,
): Promise<PageResult<Comment>> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("pageSize", pageSize.toString());

  const queryString = params.toString() ? `?${params.toString()}` : "";

  const response = await fetchWithAuth(
    `/users/${userId}/comments${queryString}`,
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export function commentsQueryOptions(userId: string, page = 1, pageSize = 25) {
  return {
    queryKey: queryKeys.users.comments(userId, page, pageSize),
    queryFn: () => getComments(userId, page, pageSize),
  };
}

export function useComments(userId: string, page = 1, pageSize = 25) {
  return useQuery(commentsQueryOptions(userId, page, pageSize));
}

async function getUploadUrl(
  extension: string,
  contentType: string,
): Promise<PictureUpload> {
  const params = new URLSearchParams();
  params.append("extension", extension);
  params.append("contentType", contentType);

  const response = await fetchWithAuth(`/users/upload?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export function useUploadAvatarUrl() {
  return useMutation({
    mutationFn: (data: { extension: string; contentType: string }) =>
      getUploadUrl(data.extension, data.contentType),
  });
}

async function updateUser(data: UserUpdate): Promise<void> {
  const response = await fetchWithAuth("/users", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.me(),
      });
    },
  });
}
