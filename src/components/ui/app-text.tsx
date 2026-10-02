import { Text, type TextProps } from 'react-native';

import { typography, useAppTheme, type ColorName, type TypographyVariant } from '@/theme';

export interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: ColorName;
  align?: 'left' | 'center' | 'right';
  /** Chữ số đều độ rộng, dùng cho giá tiền. */
  tabular?: boolean;
}

/** Chữ theo design system: biến thể typography và màu theo theme. */
export function AppText({
  variant = 'body',
  color = 'onSurface',
  align,
  tabular,
  style,
  ...rest
}: AppTextProps) {
  const { colors } = useAppTheme();
  return (
    <Text
      {...rest}
      style={[
        typography[variant],
        { color: colors[color], textAlign: align },
        tabular && { fontVariant: ['tabular-nums'] },
        style,
      ]}
    />
  );
}
