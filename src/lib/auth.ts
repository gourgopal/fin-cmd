import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase only if config is present and we're in the browser
const app = typeof window !== 'undefined' && firebaseConfig.apiKey 
  ? (!getApps().length ? initializeApp(firebaseConfig) : getApp())
  : null;

const auth = app ? getAuth(app) : null;
const provider = new GoogleAuthProvider();

export type User = FirebaseUser;

export const signIn = async (): Promise<User | null> => {
  if (!auth) {
    console.warn('Firebase is not initialized. Please add NEXT_PUBLIC_FIREBASE_* variables to .env.local');
    return null;
  }
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  if (!auth) return;
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};

export const onAuthStateChanged = (callback: (user: User | null) => void): (() => void) => {
  if (!auth) {
    // Stub fallback if firebase isn't configured
    callback(null);
    return () => {};
  }
  return firebaseOnAuthStateChanged(auth, callback);
};
