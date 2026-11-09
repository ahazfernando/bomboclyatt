import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  type UserCredential,
} from "firebase/auth";
import { getFirebaseApp } from "./client";

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

export async function signUpWithEmail(email: string, password: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
}

export async function signInWithEmail(email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(getFirebaseAuth(), email, password);
}

export async function signInWithGoogle(): Promise<UserCredential> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  provider.addScope("profile");
  provider.addScope("email");
  return signInWithPopup(getFirebaseAuth(), provider);
}

export function authErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "";

  switch (code) {
    case "auth/operation-not-allowed":
      return "Google sign-in is not enabled in Firebase. Enable it under Authentication → Sign-in method.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized for Google sign-in in Firebase.";
    case "auth/popup-blocked":
      return "Pop-up was blocked. Allow pop-ups for this site and try again.";
    case "auth/popup-closed-by-user":
      return "Sign-in cancelled.";
    case "auth/cancelled-popup-request":
      return "Sign-in cancelled.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email using a different sign-in method.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "Google sign-in failed. Try again.";
  }
}
