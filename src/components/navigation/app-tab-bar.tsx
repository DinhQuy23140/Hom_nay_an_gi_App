import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { AppText, Gradient, Icon, PressableScale, type IconName } from '@/components/ui';
import { haptics } from '@/lib/haptics';
import { motion, radius, sizes, spacing, useAppTheme } from '@/theme';

interface TabConfig {
  label: string;
  icon: IconName;
  activeIcon: IconName;
}

const TABS: Record<string, TabConfig> = {
  index: { label: 'Trang chủ', icon: 'home-outline', activeIcon: 'home' },
  explore: { label: 'Khám phá', icon: 'compass-outline', activeIcon: 'compass' },
  random: { label: 'Random', icon: 'shuffle', activeIcon: 'shuffle' },
  community: { label: 'Cộng đồng', icon: 'people-outline', activeIcon: 'people' },
  me: { label: 'Tôi', icon: 'person-outline', activeIcon: 'person' },
};

const RANDOM_ROUTE = 'random';

/** Thanh tab dưới cùng tùy biến. */
export function AppTabBar({ state, navigation, insets }: BottomTabBarProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.bar,
        {
          paddingBottom: insets.bottom,
          backgroundColor: colors.surface,
          borderTopColor: colors.outline,
        },
      ]}>
      {state.routes.map((route, index) => {
        const config = TABS[route.name];
        if (!config) return null;
        const focused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            haptics.tap();
            navigation.navigate(route.name, route.params);
          }
        };

        return route.name === RANDOM_ROUTE ? (
          <RandomTabButton key={route.key} focused={focused} onPress={onPress} />
        ) : (
          <TabItem key={route.key} config={config} focused={focused} onPress={onPress} />
        );
      })}
    </View>
  );
}

interface TabItemProps {
  config: TabConfig;
  focused: boolean;
  onPress: () => void;
}

/** Một tab thường: icon, nhãn và pill nền khi được chọn. */
function TabItem({ config, focused, onPress }: TabItemProps) {
  const progress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(focused ? 1 : 0, { duration: motion.duration.normal, easing: motion.easing });
  }, [focused, progress]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scaleX: 0.5 + progress.value * 0.5 }],
  }));

  return (
    <PressableScale
      pressedScale={0.92}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityLabel={config.label}
      accessibilityState={{ selected: focused }}
      style={styles.item}>
      <View style={styles.iconWrap}>
        <Animated.View style={[styles.pill, pillStyle]}>
          <Gradient name="leaf" direction="horizontal" fill />
        </Animated.View>
        <Icon
          name={focused ? config.activeIcon : config.icon}
          size={22}
          color={focused ? 'primaryText' : 'onSurfaceVariant'}
        />
      </View>
      <AppText variant="caption" color={focused ? 'primaryText' : 'onSurfaceVariant'} numberOfLines={1}>
        {config.label}
      </AppText>
    </PressableScale>
  );
}

/** Nút Random tròn nổi ở giữa thanh tab, xoay khi được chọn. */
function RandomTabButton({ focused, onPress }: { focused: boolean; onPress: () => void }) {
  const { colors } = useAppTheme();
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (focused) rotation.value = withSpring(rotation.value + 180, motion.spring);
  }, [focused, rotation]);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));

  return (
    <View style={styles.item}>
      <PressableScale
        pressedScale={0.9}
        onPress={onPress}
        accessibilityRole="tab"
        accessibilityLabel="Random món"
        accessibilityState={{ selected: focused }}
        style={[styles.randomButton, { borderColor: colors.surface }]}>
        <Gradient name="brand" fill />
        <Animated.View style={iconStyle}>
          <Icon name="shuffle" size={28} color="onPrimary" />
        </Animated.View>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    minHeight: sizes.tabBarHeight,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: spacing.sm,
  },
  iconWrap: { width: 56, height: 30, alignItems: 'center', justifyContent: 'center' },
  pill: { ...StyleSheet.absoluteFill, borderRadius: radius.pill, overflow: 'hidden' },
  randomButton: {
    width: sizes.randomButton,
    height: sizes.randomButton,
    borderRadius: radius.pill,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -spacing.xl,
    overflow: 'hidden',
  },
});
