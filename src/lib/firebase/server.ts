import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { firebaseConfig, isFirebaseConfigured } from "./config";

let app: FirebaseApp | undefined;
let db: Firestore | undefined;

/** Server-side Firestore access for API routes and server actions. */
export function getServerFirestore(): Firestore {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured. Add credentials to .env.local");
  }
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  if (!db) {
    db = getFirestore(app);
  }
  return db;
}

export { isFirebaseConfigured };
