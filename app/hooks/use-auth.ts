import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  applyActionCode,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  confirmPasswordReset as firebaseConfirmPasswordReset,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  linkWithCredential,
  linkWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { queryKeys } from "~/api/query-keys";
import type { Signin, Signup } from "~/api/types/user";
import { auth } from "~/lib/firebase";
import { toastError } from "~/lib/toast";

export async function ensureAnonymouslySignedIn() {
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      toastError(error);
    }
  }
}

export const signOut = () => firebaseSignOut(auth);

export const resetPassword = (email: string) =>
  sendPasswordResetEmail(auth, email);

export const confirmPasswordReset = ({
  code,
  password,
}: {
  code: string;
  password: string;
}) => firebaseConfirmPasswordReset(auth, code, password);

export const verifyEmail = (code: string) => applyActionCode(auth, code);

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

  try {
    if (auth.currentUser) {
      const credential = EmailAuthProvider.credential(
        data.email,
        data.password,
      );
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
  } catch (error) {
    const err = error as { code?: string };
    if (err.code === "auth/email-already-in-use") {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );
      user = userCredential.user;
    } else {
      throw error;
    }
  }

  if (user && !user.emailVerified) {
    try {
      await sendEmailVerification(user);
    } catch (e) {}
  }
  return user;
}

export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Signup) => signUp(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() }),
  });
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  if (auth.currentUser) {
    const userCredential = await linkWithPopup(auth.currentUser, provider);
    return userCredential.user;
  }

  const userCredential = await signInWithPopup(auth, provider);
  return userCredential.user;
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => signOut(),
    onSuccess: () => queryClient.setQueryData(queryKeys.users.me(), null),
  });
}

export const useResetPassword = () =>
  useMutation({
    mutationFn: (email: string) => resetPassword(email),
  });

export const useConfirmPasswordReset = () =>
  useMutation({
    mutationFn: (data: { code: string; password: string }) =>
      confirmPasswordReset(data),
  });

export const useVerifyEmail = () =>
  useMutation({
    mutationFn: (code: string) => verifyEmail(code),
  });
