import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useState } from 'react';
import { FlatList, StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { radius, spacing, useAppTheme } from '@/theme';

import type { PostMedia as PostMediaItem } from '../types';

interface PostMediaProps {
  media: PostMediaItem[];
}

/** Phần media của bài đăng: carousel ảnh hoặc video. */
export function PostMedia({ media }: PostMediaProps) {
  const { colors } = useAppTheme();
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const first = media[0];
  if (!first) return null;

  return (
    <View onLayout={onLayout} style={[styles.frame, { backgroundColor: colors.surfaceVariant }]}>
      {first.type === 'video' ? (
        <PostVideo url={first.url} />
      ) : (
        width > 0 && <ImageCarousel media={media} width={width} />
      )}
    </View>
  );
}

/** Trình phát video của bài đăng (expo-video). */
function PostVideo({ url }: { url: string }) {
  const player = useVideoPlayer(url, (p) => {
    p.loop = true;
    p.muted = true;
  });
  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      nativeControls
      allowsPictureInPicture={false}
    />
  );
}

/** Carousel ảnh vuốt ngang của bài đăng. */
function ImageCarousel({ media, width }: { media: PostMediaItem[]; width: number }) {
  const { colors } = useAppTheme();
  const [index, setIndex] = useState(0);

  return (
    <>
      <FlatList
        horizontal
        pagingEnabled
        data={media}
        keyExtractor={(item) => item.path}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item.url }}
            style={{ width, height: '100%' }}
            contentFit="cover"
            transition={200}
            accessibilityLabel="Ảnh món ăn"
          />
        )}
      />
      {media.length > 1 && (
        <View style={styles.dots}>
          {media.map((item, i) => (
            <View
              key={item.path}
              style={[styles.dot, { backgroundColor: colors.white, opacity: i === index ? 1 : 0.5 }]}
            />
          ))}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  frame: { width: '100%', aspectRatio: 4 / 5, borderRadius: radius.lg, overflow: 'hidden' },
  dots: {
    position: 'absolute',
    bottom: spacing.sm,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: radius.pill },
});
