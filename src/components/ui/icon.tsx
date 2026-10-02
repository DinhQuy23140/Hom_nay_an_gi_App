import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import { useAppTheme, type ColorName } from '@/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

interface IconProps {
  name: IconName;
  size?: number;
  color?: ColorName;
}

/** Icon Ionicons với màu lấy từ theme. */
export function Icon({ name, size = 24, color = 'onSurfaceVariant' }: IconProps) {
  const { colors } = useAppTheme();
  return <Ionicons name={name} size={size} color={colors[color]} />;
}
