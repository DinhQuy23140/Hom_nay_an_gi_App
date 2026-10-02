import { LinearGradient } from 'expo-linear-gradient';
import type { PropsWithChildren } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { useAppTheme, type GradientName } from '@/theme';

type Direction = 'diagonal' | 'vertical' | 'horizontal';

const POINTS: Record<Direction, { start: { x: number; y: number }; end: { x: number; y: number } }> = {
  diagonal: { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  vertical: { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } },
  horizontal: { start: { x: 0, y: 0.5 }, end: { x: 1, y: 0.5 } },
};

interface GradientProps extends PropsWithChildren {
  name: GradientName;
  direction?: Direction;
  /** Phủ kín phần tử cha (đặt làm nền); cha cần `overflow: 'hidden'` nếu có bo góc. */
  fill?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Nền gradient lấy từ theme, tự đổi theo chế độ sáng/tối. */
export function Gradient({ name, direction = 'diagonal', fill, style, children }: GradientProps) {
  const { gradients } = useAppTheme();
  return (
    <LinearGradient
      colors={gradients[name]}
      {...POINTS[direction]}
      pointerEvents={fill ? 'none' : undefined}
      style={[fill && StyleSheet.absoluteFill, style]}>
      {children}
    </LinearGradient>
  );
}
