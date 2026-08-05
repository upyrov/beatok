import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  GoogleAuthProvider,
  linkWithCredential,
  linkWithPopup,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "~/lib/firebase";
import { fetchWithAuth } from "../lib/api-client";
import { queryKeys } from "./query-keys";
import type { Signin } from "./types/user/signin";
import type { Signup } from "./types/user/signup";

export async function ensureAnonymouslySignedIn() {
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error(error);
    }
  }
}

async function signIn(data: Signin) {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    data.email,
    data.password,
  );
  return userCredential.user;
}

export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
    },
  });
}

async function signUp(data: Signup) {
  if (auth.currentUser?.isAnonymous) {
    const credential = EmailAuthProvider.credential(data.email, data.password);
    const userCredential = await linkWithCredential(
      auth.currentUser,
      credential,
    );
    return userCredential.user;
  }

  const userCredential = await createUserWithEmailAndPassword(
    auth,
    data.email,
    data.password,
  );
  return userCredential.user;
}

export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signUp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
    },
  });
}

async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();

  if (auth.currentUser?.isAnonymous) {
    try {
      const userCredential = await linkWithPopup(auth.currentUser, provider);
      return userCredential.user;
    } catch (error: any) {
      if (
        error.code === "auth/credential-already-in-use" ||
        error.code === "auth/email-already-in-use"
      ) {
        const userCredential = await signInWithPopup(auth, provider);
        return userCredential.user;
      }
      throw error;
    }
  }

  const userCredential = await signInWithPopup(auth, provider);
  return userCredential.user;
}

export function useSignInWithGoogle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signInWithGoogle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
    },
  });
}

async function signOut() {
  await fetchWithAuth("/auth/sign-out", { method: "POST" });
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.users.me(), null);
    },
  });
}
