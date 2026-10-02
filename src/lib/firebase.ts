import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, type Firestore } from 'firebase/firestore';

import { createAuth } from './create-auth';
import { env } from './env';

let auth: Auth | undefined;
let db: Firestore | undefined;

function firebaseApp(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(env.firebase);
}

export function getFirebaseAuth(): Auth {
  auth ??= createAuth(firebaseApp());
  return auth;
}

export function getDb(): Firestore {
  if (!db) {
    try {
      // WebChannel mặc định không ổn định trên React Native.
      db = initializeFirestore(firebaseApp(), { experimentalAutoDetectLongPolling: true });
    } catch {
      db = getFirestore(firebaseApp());
    }
  }
  return db;
}
