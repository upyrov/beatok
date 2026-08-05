import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  GoogleAuthProvider,
  linkWithCredential,
  linkWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  applyActionCode,
} from "firebase/auth";
import { auth } from "~/lib/firebase";
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

export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Signin) =>
      signInWithEmailAndPassword(auth, data.email, data.password),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() }),
  });
}

async function signUp(data: Signup) {
  let user;

  if (auth.currentUser?.isAnonymous) {
    const credential = EmailAuthProvider.credential(data.email, data.password);
    const userCredential = await linkWithCredential(
      auth.currentUser,
      credential,
    );
    user = userCredential.user;
  } else {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password,
    );
    user = userCredential.user;
  }

  await sendEmailVerification(user);
  return user;
}

export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signUp,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() }),
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
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() }),
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => signOut(auth),
    onSuccess: () => queryClient.setQueryData(queryKeys.users.me(), null),
  });
}

export const useResetPassword = () =>
  useMutation({
    mutationFn: (email: string) => sendPasswordResetEmail(auth, email),
  });

export const useConfirmPasswordReset = () =>
  useMutation({
    mutationFn: ({ code, password }: { code: string; password: string }) =>
      confirmPasswordReset(auth, code, password),
  });

export const useVerifyEmail = () =>
  useMutation({
    mutationFn: (code: string) => applyActionCode(auth, code),
  });
