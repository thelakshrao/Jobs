import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported as analyticsIsSupported } from "firebase/analytics";
import { getMessaging, isSupported as messagingIsSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// getApps()/getApp() guard prevents "app already exists" errors during
// Next.js Fast Refresh / HMR, where this module can be re-evaluated
// without a full page reload.
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// getAuth() is idempotent per app instance — safe to call on every
// module evaluation, including across Fast Refresh reloads. This avoids
// the fragile initializeAuth()-throws-then-getAuth()-fallback pattern,
// which can leave `auth` in an inconsistent state relative to other
// objects (like GoogleAuthProvider) created in the same module.
export const auth = getAuth(app);

// Best-effort: prefer IndexedDB persistence, fall back to localStorage.
// Wrapped in try/catch + only run in the browser, since neither
// persistence type is available during SSR.
if (typeof window !== "undefined") {
  setPersistence(auth, indexedDBLocalPersistence).catch(() => {
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.error("Failed to set any auth persistence:", err);
    });
  });
}

export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Analytics and Messaging are optional/non-critical services. Guard them
// individually so a failure here (missing measurementId, unsupported
// browser, no service worker registered, tracking protection, etc.)
// can never break auth/db for the rest of the app.
export let analytics = null;
export let messaging = null;

if (typeof window !== "undefined") {
  analyticsIsSupported()
    .then((supported) => {
      if (supported) {
        try {
          analytics = getAnalytics(app);
        } catch (err) {
          console.error("Analytics init failed:", err);
        }
      }
    })
    .catch((err) => console.error("Analytics support check failed:", err));

  messagingIsSupported()
    .then((supported) => {
      if (supported) {
        try {
          messaging = getMessaging(app);
        } catch (err) {
          console.error("Messaging init failed:", err);
        }
      }
    })
    .catch((err) => console.error("Messaging support check failed:", err));
}

export const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
export { firebaseConfig, signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail };

export default app;