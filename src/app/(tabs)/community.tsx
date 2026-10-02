import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, EmptyState, Gradient, Icon, PressableScale, SegmentedControl, Skeleton } from '@/components/ui';
import { PostCard } from '@/features/community/components/post-card';
import type { FeedScope } from '@/features/community/posts.service';
import { useFeed } from '@/features/community/use-posts';
import { isSupabaseConfigured } from '@/lib/env';
import { motion, radius, spacing, useAppTheme, useMotion } from '@/theme';

const SCOPES = [
  { value: 'public' as const, label: 'Mới nhất', icon: 'globe-outline' as const },
  { value: 'mine' as const, label: 'Của tôi', icon: 'person-outline' as const },
];

/** Tab Cộng đồng (/community): bảng tin bài đăng (Mới nhất / Của tôi) và nút Đăng bài. */
export default function CommunityScreen() {
  const { colors } = useAppTheme();
  const { pick } = useMotion();
  const insets = useSafeAreaInsets();
  const [scope, setScope] = useState<FeedScope>('public');
  const feed = useFeed(scope);
  const posts = feed.data?.pages.flatMap((page) => page.posts) ?? [];

  return (
    <View style={[styles.flex, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <Gradient name="background" direction="vertical" fill />
      <FlatList
        data={posts}
        keyExtractor={(post) => post.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <AppText variant="headline">Cộng đồng</AppText>
            <SegmentedControl options={SCOPES} value={scope} onChange={setScope} />
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View
            entering={pick(
              FadeInDown.duration(motion.duration.slow)
                .delay(Math.min(index, 4) * 50)
                .easing(motion.easing),
            )}>
            <PostCard post={item} />
          </Animated.View>
        )}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={
          feed.isPending ? (
            <FeedSkeleton />
          ) : feed.isError ? (
            <EmptyState
              icon="cloud-offline-outline"
              title="Không tải được bài viết"
              message="Kiểm tra kết nối mạng rồi thử lại nhé."
              actionLabel="Thử lại"
              onAction={() => void feed.refetch()}
            />
          ) : (
            <EmptyState
              icon="camera-outline"
              title={scope === 'mine' ? 'Bạn chưa đăng bài nào' : 'Chưa có bài viết'}
              message="Chia sẻ món bạn vừa ăn để mọi người cùng thèm nhé!"
            />
          )
        }
        ListFooterComponent={
          feed.isFetchingNextPage ? <ActivityIndicator color={colors.primary} style={styles.footer} /> : null
        }
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (feed.hasNextPage && !feed.isFetchingNextPage) void feed.fetchNextPage();
        }}
        refreshControl={
          <RefreshControl
            refreshing={feed.isRefetching && !feed.isFetchingNextPage}
            onRefresh={() => void feed.refetch()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />

      <PressableScale
        haptic
        disabled={!isSupabaseConfigured}
        onPress={() => router.push('/post/new')}
        accessibilityRole="button"
        accessibilityLabel="Đăng bài mới"
        style={styles.fab}>
        <Gradient name="brand" direction="horizontal" fill />
        <Icon name="add" size={24} color="onPrimary" />
        <AppText variant="label" color="onPrimary">
          Đăng bài
        </AppText>
      </PressableScale>
    </View>
  );
}

/** Khoảng cách giữa các bài đăng trong bảng tin. */
function Separator() {
  return <View style={styles.separator} />;
}

/** Khung giữ chỗ khi bảng tin đang tải lần đầu. */
function FeedSkeleton() {
  return (
    <View style={styles.skeletons}>
      {[0, 1].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <View style={styles.skeletonHeader}>
            <Skeleton width={40} height={40} radius={radius.pill} />
            <Skeleton width={140} height={14} />
          </View>
          <Skeleton height={320} radius={radius.lg} />
          <Skeleton width="60%" height={14} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { paddingHorizontal: spacing.screen, paddingBottom: 120 },
  header: { gap: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.lg },
  separator: { height: spacing.md },
  footer: { paddingVertical: spacing.lg },
  fab: {
    position: 'absolute',
    right: spacing.screen,
    bottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    height: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  skeletons: { gap: spacing.lg },
  skeletonCard: { gap: spacing.md },
  skeletonHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
