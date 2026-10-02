import { router } from 'expo-router';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { AppText, Button, Gradient, Icon, Screen, type IconName } from '@/components/ui';
import { radius, spacing, type ColorName, type GradientName } from '@/theme';

interface Slide {
  icon: IconName;
  tone: { bg: GradientName; fg: ColorName };
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    icon: 'restaurant-outline',
    tone: { bg: 'leaf', fg: 'primaryText' },
    title: 'Hết đau đầu mỗi bữa',
    body: 'Gợi ý món hợp khẩu vị, thời tiết và túi tiền chỉ trong một chạm.',
  },
  {
    icon: 'shuffle',
    tone: { bg: 'lagoon', fg: 'secondaryText' },
    title: 'Random cho vui',
    body: 'Quay vòng, kéo máy xèng hay vuốt thẻ — lắc điện thoại cũng ra món.',
  },
  {
    icon: 'people-outline',
    tone: { bg: 'lavender', fg: 'dessert' },
    title: 'Chia sẻ món ngon',
    body: 'Đăng ảnh, video món đã ăn và xem mọi người hôm nay ăn gì.',
  },
];

/** Màn Chào mừng (/welcome): 3 slide giới thiệu app, dẫn sang Đăng ký hoặc Đăng nhập. */
export default function WelcomeScreen() {
  const { width } = useWindowDimensions();
  const scrollX = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
  });

  return (
    <Screen
      edges={['top']}
      padded={false}
      footer={
        <View style={styles.actions}>
          <Button label="Bắt đầu" onPress={() => router.push('/sign-up')} />
          <Button label="Tôi đã có tài khoản" variant="text" onPress={() => router.push('/sign-in')} />
        </View>
      }>
      <View style={styles.brand}>
        <AppText variant="title" color="primaryText">
          Hôm nay ăn gì
        </AppText>
      </View>

      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={styles.flex}>
        {SLIDES.map((slide, index) => (
          <SlideView key={slide.title} slide={slide} index={index} width={width} scrollX={scrollX} />
        ))}
      </Animated.ScrollView>

      <View style={styles.dots}>
        {SLIDES.map((slide, index) => (
          <Dot key={slide.title} index={index} width={width} scrollX={scrollX} />
        ))}
      </View>
    </Screen>
  );
}

interface PagerItemProps {
  index: number;
  width: number;
  scrollX: SharedValue<number>;
}

/** Một slide giới thiệu: hình minh họa có hiệu ứng parallax khi vuốt và đoạn mô tả. */
function SlideView({ slide, index, width, scrollX }: PagerItemProps & { slide: Slide }) {
  const artStyle = useAnimatedStyle(() => {
    const progress = scrollX.value / width - index;
    return {
      opacity: interpolate(Math.abs(progress), [0, 1], [1, 0.3], Extrapolation.CLAMP),
      transform: [
        { scale: interpolate(Math.abs(progress), [0, 1], [1, 0.8], Extrapolation.CLAMP) },
        { translateX: interpolate(progress, [-1, 0, 1], [width * 0.25, 0, -width * 0.25]) },
      ],
    };
  });

  return (
    <View style={[styles.slide, { width }]}>
      <Animated.View style={[styles.art, artStyle]}>
        <Gradient name={slide.tone.bg} fill />
        <Icon name={slide.icon} size={88} color={slide.tone.fg} />
      </Animated.View>
      <View style={styles.texts}>
        <AppText variant="headline" align="center">
          {slide.title}
        </AppText>
        <AppText variant="body" color="onSurfaceVariant" align="center">
          {slide.body}
        </AppText>
      </View>
    </View>
  );
}

/** Chấm chỉ trang, kéo dài khi slide tương ứng đang hiện. */
function Dot({ index, width, scrollX }: PagerItemProps) {
  const style = useAnimatedStyle(() => {
    const distance = Math.abs(scrollX.value / width - index);
    return {
      width: interpolate(distance, [0, 1], [24, 8], Extrapolation.CLAMP),
      opacity: interpolate(distance, [0, 1], [1, 0.35], Extrapolation.CLAMP),
    };
  });
  return (
    <Animated.View style={[styles.dot, style]}>
      <Gradient name="fresh" direction="horizontal" fill />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  brand: { alignItems: 'center', paddingVertical: spacing.md },
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.xl },
  art: {
    width: 220,
    height: 220,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  texts: { gap: spacing.sm, maxWidth: 340 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  dot: { height: 8, borderRadius: radius.pill, overflow: 'hidden' },
  actions: { gap: spacing.xs },
});
