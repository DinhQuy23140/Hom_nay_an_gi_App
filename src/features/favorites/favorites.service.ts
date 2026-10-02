import { collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc, type Unsubscribe } from 'firebase/firestore';

import { getDb } from '@/lib/firebase';

const favoritesCol = (uid: string) => collection(getDb(), 'users', uid, 'favorites');

export function subscribeFavorites(uid: string, onData: (slugs: string[]) => void): Unsubscribe {
  return onSnapshot(favoritesCol(uid), (snapshot) => onData(snapshot.docs.map((d) => d.id)));
}

export async function setFavorite(uid: string, slug: string, favorite: boolean) {
  const ref = doc(favoritesCol(uid), slug);
  if (favorite) {
    await setDoc(ref, { createdAt: serverTimestamp() });
  } else {
    await deleteDoc(ref);
  }
}
