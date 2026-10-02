import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';

import { updateDisplayName } from '@/features/profile/profile.service';
import { useFiltersStore } from '@/features/recommendation/filters.store';
import { getFirebaseAuth } from '@/lib/firebase';

import { getGoogleIdToken, signOutGoogle } from './google-sign-in';

export async function signInWithEmail(email: string, password: string) {
  await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
}

export async function signUpWithEmail(name: string, email: string, password: string) {
  const { user } = await createUserWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
  await updateProfile(user, { displayName: name.trim() });
  await updateDisplayName(user.uid, name.trim());
}

export async function sendPasswordReset(email: string) {
  const auth = getFirebaseAuth();
  auth.languageCode = 'vi';
  await sendPasswordResetEmail(auth, email.trim());
}

/** @returns false nếu người dùng hủy hộp thoại Google. */
export async function signInWithGoogle(): Promise<boolean> {
  const idToken = await getGoogleIdToken();
  if (!idToken) return false;
  await signInWithCredential(getFirebaseAuth(), GoogleAuthProvider.credential(idToken));
  return true;
}

export async function signOut() {
  await signOutGoogle();
  await firebaseSignOut(getFirebaseAuth());
  useFiltersStore.getState().clear();
}
