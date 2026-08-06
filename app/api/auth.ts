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
import { auth } from "~/lib/firebase";
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

export function signIn(data: Signin) {
  return signInWithEmailAndPassword(auth, data.email, data.password);
}

export async function signUp(data: Signup) {
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
  } catch (error: any) {
    if (error.code === "auth/email-already-in-use") {
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

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();

  try {
    if (auth.currentUser) {
      const userCredential = await linkWithPopup(auth.currentUser, provider);
      return userCredential.user;
    }

    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  } catch (error: any) {
    if (
      error.code === "auth/credential-already-in-use" ||
      error.code === "auth/email-already-in-use" ||
      error.code === "auth/account-exists-with-different-credential"
    ) {
      const userCredential = await signInWithPopup(auth, provider);
      return userCredential.user;
    }
    throw error;
  }
}

export function signOut() {
  return firebaseSignOut(auth);
}

export function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}

export function confirmPasswordReset({
  code,
  password,
}: {
  code: string;
  password: string;
}) {
  return firebaseConfirmPasswordReset(auth, code, password);
}

export function verifyEmail(code: string) {
  return applyActionCode(auth, code);
}
