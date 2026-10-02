import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';

import { getDb } from '@/lib/firebase';

import type { InteractionEvent, InteractionSurface, InteractionType } from './types';

const HISTORY_LIMIT = 150;

const eventsCol = (uid: string) => collection(getDb(), 'users', uid, 'events');

export function subscribeHistory(uid: string, onData: (events: InteractionEvent[]) => void): Unsubscribe {
  const q = query(eventsCol(uid), orderBy('createdAt', 'desc'), limit(HISTORY_LIMIT));
  return onSnapshot(q, (snapshot) =>
    onData(
      snapshot.docs.map((d) => {
        const data = d.data({ serverTimestamps: 'estimate' });
        return {
          id: d.id,
          type: data.type as InteractionType,
          slug: data.slug as string,
          surface: data.surface as InteractionSurface,
          createdAt: (data.createdAt as Timestamp | null)?.toDate() ?? new Date(),
        };
      }),
    ),
  );
}

export async function logInteraction(
  uid: string,
  type: InteractionType,
  slug: string,
  surface: InteractionSurface,
) {
  await addDoc(eventsCol(uid), { type, slug, surface, createdAt: serverTimestamp() });
}
