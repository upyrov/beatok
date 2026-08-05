import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "~/lib/firebase";
import { handleApiError } from "../lib/api-client";
import { queryKeys } from "./query-keys";
import type { Signin } from "./types/user/signin";
import type { Signup } from "./types/user/signup";

async function signIn(data: Signin) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      data.email,
      data.password,
    );
    const user = userCredential.user;
    console.info(user);
  } catch (error) {
    console.error(error);
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

async function signUp(data: Signup) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password,
    );
    console.info(userCredential.user);
  } catch (error) {
    console.error(error);
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

async function getGoogleAuthUrl() {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/auth/google/url`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    },
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.text();
}

export function useGoogleAuthUrl() {
  return useMutation({
    mutationFn: getGoogleAuthUrl,
    onSuccess: (url) => {
      window.location.href = url;
    },
  });
}

export async function googleCallback(search: string) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/auth/google/callback${search}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    },
  );

  if (!response.ok) {
    await handleApiError(response);
  }
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
