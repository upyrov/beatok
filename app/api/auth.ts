import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";

async function signIn(body: { email: string; password?: string }) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/auth/sign-in`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
}

export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signIn,
    onSuccess: (data) => queryClient.setQueryData(queryKeys.users.me(), data),
  });
}

async function signUp(body: {
  name: string;
  email: string;
  password?: string;
}) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/auth/sign-up`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
}

export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signUp,
    onSuccess: (data) => queryClient.setQueryData(queryKeys.users.me(), data),
  });
}

async function signOut() {
  await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/sign-out`, {
    method: "POST",
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => queryClient.setQueryData(queryKeys.users.me(), null),
  });
}
