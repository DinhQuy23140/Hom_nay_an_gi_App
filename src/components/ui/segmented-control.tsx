import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { haptics } from '@/lib/haptics';
import { motion, radius, spacing, useAppTheme, useMotion } from '@/theme';

import { AppText } from './app-text';
import { Icon, type IconName } from './icon';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: IconName;
}

interface SegmentedControlProps<T extends string> {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Nhóm lựa chọn dạng pill với nền trượt mượt theo mục đang chọn. */
export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  const { colors } = useAppTheme();
  const { reduced } = useMotion();
  const [width, setWidth] = useState(0);
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const segmentWidth = width / options.length;
  const translateX = useSharedValue(0);

  useEffect(() => {
    const target = index * segmentWidth;
    translateX.value = reduced ? target : withSpring(target, motion.spring);
  }, [index, segmentWidth, reduced, translateX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      accessibilityRole="tablist"
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width - spacing.xs * 2)}
      style={[styles.container, { backgroundColor: colors.surfaceVariant }]}>
      {width > 0 && (
        <Animated.View
          style={[
            styles.indicator,
            { width: segmentWidth, backgroundColor: colors.surface },
            indicatorStyle,
          ]}
        />
      )}
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => {
              if (!selected) {
                haptics.tap();
                onChange(option.value);
              }
            }}
            style={styles.segment}>
            {option.icon && (
              <Icon name={option.icon} size={18} color={selected ? 'primaryText' : 'onSurfaceVariant'} />
            )}
            <AppText variant="label" color={selected ? 'onSurface' : 'onSurfaceVariant'}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: radius.pill,
    padding: spacing.xs,
  },
  indicator: {
    position: 'absolute',
    top: spacing.xs,
    bottom: spacing.xs,
    left: spacing.xs,
    borderRadius: radius.pill,
  },
  segment: {
    flex: 1,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
});
