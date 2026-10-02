import { router } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';

import { AppText, Avatar, Gradient, Icon, IconButton, PressableScale } from '@/components/ui';
import { useAuth } from '@/features/auth/auth-provider';
import { motion, radius, spacing, useAppTheme, useMotion } from '@/theme';
import { formatRelativeTime } from '@/utils/format';

import { useDeletePost, useToggleLike } from '../use-posts';
import type { Post } from '../types';
import { PostMedia } from './post-media';
import { RatingStars } from './rating-stars';

/** Thẻ bài đăng trong bảng tin cộng đồng. */
export function PostCard({ post }: { post: Post }) {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const isMine = user?.uid === post.authorId;
  const deletePost = useDeletePost();

  const confirmDelete = () =>
    Alert.alert('Xóa bài đăng?', 'Ảnh/video của bài cũng sẽ bị xóa.', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: () => deletePost.mutate(post) },
    ]);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Avatar name={post.authorName} uri={post.authorPhoto} size={40} />
        <View style={styles.flex}>
          <AppText variant="bodyMedium" numberOfLines={1}>
            {post.authorName}
          </AppText>
          <View style={styles.metaRow}>
            <AppText variant="caption" color="onSurfaceVariant">
              {formatRelativeTime(post.createdAt)}
            </AppText>
            {post.visibility === 'PRIVATE' && <Icon name="lock-closed-outline" size={12} />}
          </View>
        </View>
        {isMine && (
          <IconButton
            icon="trash-outline"
            size={40}
            accessibilityLabel="Xóa bài đăng"
            disabled={deletePost.isPending}
            onPress={confirmDelete}
          />
        )}
      </View>

      <PostMedia media={post.media} />

      <View style={styles.body}>
        <View style={styles.foodRow}>
          <PressableScale
            disabled={!post.foodSlug}
            onPress={() =>
              post.foodSlug && router.push({ pathname: '/food/[slug]', params: { slug: post.foodSlug } })
            }
            style={styles.foodChip}>
            <Gradient name="leaf" direction="horizontal" fill />
            <Icon name="restaurant-outline" size={14} color="primaryText" />
            <AppText variant="label" color="primaryText" numberOfLines={1}>
              {post.foodName}
            </AppText>
          </PressableScale>
          <RatingStars value={post.rating} />
        </View>
        {post.content.length > 0 && <AppText>{post.content}</AppText>}
        <LikeButton post={post} />
      </View>
    </View>
  );
}

/** Nút thích bài đăng, có hiệu ứng nảy và cập nhật lạc quan. */
function LikeButton({ post }: { post: Post }) {
  const toggleLike = useToggleLike();
  const { reduced } = useMotion();
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <PressableScale
      haptic
      disabled={toggleLike.isPending}
      onPress={() => {
        if (!reduced && !post.likedByMe) {
          scale.set(withSequence(withTiming(1.3, { duration: motion.duration.fast }), withSpring(1, motion.spring)));
        }
        toggleLike.mutate({ post, liked: !post.likedByMe });
      }}
      accessibilityRole="button"
      accessibilityLabel={post.likedByMe ? 'Bỏ thích' : 'Thích'}
      accessibilityState={{ selected: post.likedByMe }}
      style={styles.like}>
      <Animated.View style={style}>
        <Icon name={post.likedByMe ? 'heart' : 'heart-outline'} size={22} color={post.likedByMe ? 'error' : 'onSurfaceVariant'} />
      </Animated.View>
      <AppText variant="label" color="onSurfaceVariant" tabular>
        {post.likeCount}
      </AppText>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { borderRadius: radius.xl, padding: spacing.md, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  body: { gap: spacing.sm },
  foodRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  foodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    height: 32,
    borderRadius: radius.pill,
    flexShrink: 1,
    overflow: 'hidden',
  },
  like: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, alignSelf: 'flex-start', minHeight: 40 },
});
