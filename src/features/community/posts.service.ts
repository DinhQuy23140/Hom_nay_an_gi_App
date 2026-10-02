import type { User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  where,
  writeBatch,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';

import { getDb } from '@/lib/firebase';

import { removeMedia, uploadPostMedia } from './media.service';
import type { NewPostInput, Post, PostMedia } from './types';

const PAGE_SIZE = 10;

const postsCol = () => collection(getDb(), 'posts');
const likeDoc = (postId: string, uid: string) => doc(getDb(), 'posts', postId, 'likes', uid);

export type FeedScope = 'public' | 'mine';

export interface FeedPage {
  posts: Post[];
  cursor: QueryDocumentSnapshot | null;
}

function parsePost(snapshot: QueryDocumentSnapshot, likedByMe: boolean): Post {
  const data = snapshot.data({ serverTimestamps: 'estimate' });
  return {
    id: snapshot.id,
    authorId: data.authorId,
    authorName: data.authorName ?? 'Ẩn danh',
    authorPhoto: data.authorPhoto ?? null,
    foodSlug: data.foodSlug ?? null,
    foodName: data.foodName,
    rating: data.rating,
    content: data.content ?? '',
    media: (data.media ?? []) as PostMedia[],
    visibility: data.visibility,
    likeCount: data.likeCount ?? 0,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    likedByMe,
  };
}

export async function fetchFeedPage(
  uid: string,
  scope: FeedScope,
  cursor: QueryDocumentSnapshot | null,
): Promise<FeedPage> {
  const constraints: QueryConstraint[] = [
    scope === 'public' ? where('visibility', '==', 'PUBLIC') : where('authorId', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(PAGE_SIZE),
  ];
  if (cursor) constraints.splice(2, 0, startAfter(cursor));

  const snapshot = await getDocs(query(postsCol(), ...constraints));
  const liked = await Promise.all(
    snapshot.docs.map((d) => getDoc(likeDoc(d.id, uid)).then((s) => s.exists())),
  );

  return {
    posts: snapshot.docs.map((d, i) => parsePost(d, liked[i])),
    cursor: snapshot.docs.length === PAGE_SIZE ? snapshot.docs[snapshot.docs.length - 1] : null,
  };
}

/**
 * Upload media lên Supabase trước, rồi mới ghi bài vào Firestore.
 * Nếu ghi Firestore lỗi thì dọn file đã upload để không để lại rác.
 */
export async function createPost(
  user: User,
  displayName: string | null,
  input: NewPostInput,
  onProgress?: (done: number, total: number) => void,
) {
  const ref = doc(postsCol());
  const media = await uploadPostMedia(user.uid, ref.id, input.media, onProgress);

  try {
    await setDoc(ref, {
      authorId: user.uid,
      authorName: displayName ?? user.displayName ?? 'Ẩn danh',
      authorPhoto: user.photoURL ?? null,
      foodSlug: input.foodSlug,
      foodName: input.foodName.trim(),
      rating: input.rating,
      content: input.content.trim(),
      media,
      visibility: input.visibility,
      likeCount: 0,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    await removeMedia(media.map((m) => m.path));
    throw error;
  }
}

export async function setPostLiked(postId: string, uid: string, liked: boolean) {
  const batch = writeBatch(getDb());
  if (liked) batch.set(likeDoc(postId, uid), { createdAt: serverTimestamp() });
  else batch.delete(likeDoc(postId, uid));
  batch.update(doc(postsCol(), postId), { likeCount: increment(liked ? 1 : -1) });
  await batch.commit();
}

export async function deletePost(post: Post) {
  await deleteDoc(doc(postsCol(), post.id));
  await removeMedia(post.media.map((m) => m.path));
}
