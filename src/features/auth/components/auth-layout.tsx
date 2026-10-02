import type { PropsWithChildren, ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppText, Screen, ScreenHeader } from '@/components/ui';
import { motion, spacing, useAppTheme, useMotion } from '@/theme';

interface AuthLayoutProps extends PropsWithChildren {
  title: string;
  subtitle?: string;
  footer?: ReactNode;
}

/** Khung chung cho các màn đăng nhập/đăng ký: tiêu đề + form trượt nhẹ lên khi vào. */
export function AuthLayout({ title, subtitle, footer, children }: AuthLayoutProps) {
  const { pick } = useMotion();

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen scroll edges={['top', 'bottom']} header={<ScreenHeader />}>
        <Animated.View
          entering={pick(FadeInDown.duration(motion.duration.slow).easing(motion.easing))}
          style={styles.titleBlock}>
          <AppText variant="headline">{title}</AppText>
          {subtitle && (
            <AppText variant="body" color="onSurfaceVariant">
              {subtitle}
            </AppText>
          )}
        </Animated.View>
        <Animated.View
          entering={pick(FadeInDown.duration(motion.duration.slow).delay(60).easing(motion.easing))}
          style={styles.form}>
          {children}
        </Animated.View>
        {footer && <View style={styles.footer}>{footer}</View>}
      </Screen>
    </KeyboardAvoidingView>
  );
}

/** Đường kẻ ngang có chữ "hoặc" giữa đăng nhập email và Google. */
export function OrDivider() {
  const { colors } = useAppTheme();
  const line = [styles.line, { backgroundColor: colors.outline }];
  return (
    <View style={styles.divider}>
      <View style={line} />
      <AppText variant="caption" color="onSurfaceVariant">
        hoặc
      </AppText>
      <View style={line} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  titleBlock: { gap: spacing.sm, marginTop: spacing.sm, marginBottom: spacing.lg },
  form: { gap: spacing.md },
  footer: { marginTop: spacing.lg, alignItems: 'center' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: spacing.xs },
  line: { flex: 1, height: StyleSheet.hairlineWidth },
});
