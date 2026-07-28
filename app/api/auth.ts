import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";
import type { UserSignin } from "./types/user/user-signin";
import type { UserSignup } from "./types/user/user-signup";
import { handleApiError } from "../lib/api-client";

async function signIn(data: UserSignin) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/auth/sign-in`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    },
  );

  if (!response.ok) {
    await handleApiError(response);
  }
}

export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signIn,
    onSuccess: () => {
      queryClient.setQueryData(["auth", "status"], "authenticated");
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
    },
  });
}

async function signUp(data: UserSignup) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/auth/sign-up`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    },
  );

  if (!response.ok) {
    await handleApiError(response);
  }
}

export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signUp,
    onSuccess: () => {
      queryClient.setQueryData(["auth", "status"], "authenticated");
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
    },
  });
}

async function signOut() {
  await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/sign-out`, {
    method: "POST",
    credentials: "include",
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.setQueryData(["auth", "status"], "unauthenticated");
      queryClient.setQueryData(queryKeys.users.me(), null);
    },
  });
}

export async function refresh() {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return null;
}
