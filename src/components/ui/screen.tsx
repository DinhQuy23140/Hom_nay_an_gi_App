import type { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets, type Edge } from 'react-native-safe-area-context';

import { spacing, useAppTheme } from '@/theme';

import { Gradient } from './gradient';

interface ScreenProps extends PropsWithChildren {
  scroll?: boolean;
  /** Cạnh cần chừa safe area. Mặc định chỉ chừa cạnh trên. */
  edges?: Edge[];
  padded?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  scrollProps?: Omit<ScrollViewProps, 'contentContainerStyle'>;
}

/** Khung màn hình chuẩn: safe area, nền gradient, cuộn hoặc không, header/footer cố định. */
export function Screen({
  children,
  scroll = false,
  edges = ['top'],
  padded = true,
  header,
  footer,
  contentStyle,
  scrollProps,
}: ScreenProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: edges.includes('top') ? insets.top : 0,
    paddingBottom: edges.includes('bottom') && !footer ? insets.bottom : 0,
  };

  const inner: StyleProp<ViewStyle> = [padded && styles.padded, contentStyle];

  return (
    <View style={containerStyle}>
      <Gradient name="background" direction="vertical" fill />
      {header}
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          {...scrollProps}
          contentContainerStyle={[inner, styles.scrollContent]}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, inner]}>{children}</View>
      )}
      {footer && (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          {footer}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  padded: { paddingHorizontal: spacing.screen },
  scrollContent: { paddingBottom: spacing.xxl },
  footer: { paddingHorizontal: spacing.screen, paddingTop: spacing.sm },
});
