import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  confirmPasswordReset,
  resetPassword,
  signIn,
  signInWithGoogle,
  signOut,
  signUp,
  verifyEmail,
} from "~/api/auth";
import { queryKeys } from "~/api/query-keys";
import type { Signin } from "~/api/types/user/signin";
import type { Signup } from "~/api/types/user/signup";

export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Signin) => signIn(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() }),
  });
}

export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Signup) => signUp(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() }),
  });
}

export function useSignInWithGoogle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => signInWithGoogle(),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() }),
  });
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
