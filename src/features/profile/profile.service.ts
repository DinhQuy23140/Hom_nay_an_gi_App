import type { User } from 'firebase/auth';
import { doc, onSnapshot, serverTimestamp, setDoc, type DocumentData, type Unsubscribe } from 'firebase/firestore';

import { getDb } from '@/lib/firebase';

import {
  DEFAULT_PREFERENCES,
  DEFAULT_RESTRICTIONS,
  type DietaryRestrictions,
  type TastePreferences,
  type UserProfile,
} from './types';

const userDoc = (uid: string) => doc(getDb(), 'users', uid);

function parseProfile(user: User, data: DocumentData): UserProfile {
  return {
    uid: user.uid,
    displayName: data.displayName ?? user.displayName,
    email: data.email ?? user.email,
    photoURL: data.photoURL ?? user.photoURL,
    onboarded: data.onboarded === true,
    preferences: { ...DEFAULT_PREFERENCES, ...data.preferences },
    restrictions: { ...DEFAULT_RESTRICTIONS, ...data.restrictions },
  };
}

/** Theo dõi hồ sơ realtime; tự tạo hồ sơ mặc định ở lần đăng nhập đầu tiên. */
export function subscribeProfile(
  user: User,
  onData: (profile: UserProfile) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    userDoc(user.uid),
    (snapshot) => {
      if (!snapshot.exists()) {
        setDoc(userDoc(user.uid), {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          onboarded: false,
          preferences: DEFAULT_PREFERENCES,
          restrictions: DEFAULT_RESTRICTIONS,
          createdAt: serverTimestamp(),
        }).catch(onError);
        return;
      }
      onData(parseProfile(user, snapshot.data()));
    },
    onError,
  );
}

export async function completeOnboarding(
  uid: string,
  preferences: TastePreferences,
  restrictions: DietaryRestrictions,
) {
  await setDoc(
    userDoc(uid),
    { preferences, restrictions, onboarded: true, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function updatePreferences(uid: string, preferences: TastePreferences) {
  await setDoc(userDoc(uid), { preferences, updatedAt: serverTimestamp() }, { merge: true });
}

export async function updateRestrictions(uid: string, restrictions: DietaryRestrictions) {
  await setDoc(userDoc(uid), { restrictions, updatedAt: serverTimestamp() }, { merge: true });
}

export async function updateDisplayName(uid: string, displayName: string) {
  await setDoc(userDoc(uid), { displayName, updatedAt: serverTimestamp() }, { merge: true });
}
