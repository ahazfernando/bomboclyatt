import {
  createUserWithEmailAndPassword,
  getAuth,
  GithubAuthProvider,
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
  return signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
}

export async function signInWithGithub(): Promise<UserCredential> {
  return signInWithPopup(getFirebaseAuth(), new GithubAuthProvider());
}
