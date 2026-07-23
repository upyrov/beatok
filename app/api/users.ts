import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";
import type { User } from "./types/user/user";
import type { Comment } from "./types/comment/comment";
import type { CreateComment } from "./types/comment/create-comment";
import type { PageResult } from "./types/page-result";
import { fetchWithAuth } from "../lib/api-client";

async function getUser(): Promise<User> {
  const response = await fetchWithAuth("/users/me");

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export function useUser() {
  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: getUser,
  });
}

async function getUserById(id: string): Promise<User> {
  const response = await fetchWithAuth(`/users/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

export function useUserById(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => getUserById(id),
  });
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

export function useComments(userId: string, page = 1, pageSize = 25) {
  return useQuery({
    queryKey: queryKeys.users.comments(userId, page, pageSize),
    queryFn: () => getComments(userId, page, pageSize),
  });
}
