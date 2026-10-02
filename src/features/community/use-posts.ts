import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';

import { useAuth } from '@/features/auth/auth-provider';

import { deletePost, fetchFeedPage, setPostLiked, type FeedPage, type FeedScope } from './posts.service';
import type { Post } from './types';

const feedKey = (uid: string | undefined, scope: FeedScope) => ['feed', uid, scope] as const;

export function useFeed(scope: FeedScope) {
  const { user } = useAuth();
  return useInfiniteQuery({
    queryKey: feedKey(user?.uid, scope),
    queryFn: ({ pageParam }) => fetchFeedPage(user!.uid, scope, pageParam),
    initialPageParam: null as FeedPage['cursor'],
    getNextPageParam: (last) => last.cursor,
    enabled: !!user,
  });
}

type FeedData = InfiniteData<FeedPage, FeedPage['cursor']>;

function updatePostInFeeds(
  client: ReturnType<typeof useQueryClient>,
  postId: string,
  update: (post: Post) => Post | null,
) {
  client.setQueriesData<FeedData>({ queryKey: ['feed'] }, (data) =>
    data
      ? {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            posts: page.posts.flatMap((p) => {
              if (p.id !== postId) return [p];
              const next = update(p);
              return next ? [next] : [];
            }),
          })),
        }
      : data,
  );
}

/** Like lạc quan: cập nhật UI ngay, hoàn tác nếu ghi Firestore lỗi. */
export function useToggleLike() {
  const { user } = useAuth();
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ post, liked }: { post: Post; liked: boolean }) => setPostLiked(post.id, user!.uid, liked),
    onMutate: ({ post, liked }) => {
      updatePostInFeeds(client, post.id, (p) => ({
        ...p,
        likedByMe: liked,
        likeCount: Math.max(0, p.likeCount + (liked ? 1 : -1)),
      }));
    },
    onError: (_error, { post }) => {
      updatePostInFeeds(client, post.id, () => post);
    },
  });
}

export function useDeletePost() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: deletePost,
    onSuccess: (_data, post) => updatePostInFeeds(client, post.id, () => null),
  });
}
