import type { ReactNode } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { radius, spacing, useAppTheme, type ColorName } from '@/theme';

import { AppText } from './app-text';
import { Icon, type IconName } from './icon';
import { PressableScale } from './pressable-scale';

interface ListRowProps {
  icon?: IconName;
  iconColor?: ColorName;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  right?: ReactNode;
  destructive?: boolean;
}

/** Một hàng trong danh sách kiểu cài đặt: icon, tiêu đề, phụ đề, giá trị. */
export function ListRow({ icon, iconColor, title, subtitle, value, onPress, right, destructive }: ListRowProps) {
  const content = (
    <>
      {icon && <Icon name={icon} size={22} color={destructive ? 'error' : (iconColor ?? 'onSurfaceVariant')} />}
      <View style={styles.texts}>
        <AppText variant="bodyMedium" color={destructive ? 'error' : 'onSurface'}>
          {title}
        </AppText>
        {subtitle && (
          <AppText variant="bodySmall" color="onSurfaceVariant">
            {subtitle}
          </AppText>
        )}
      </View>
      {value && (
        <AppText variant="bodySmall" color="onSurfaceVariant">
          {value}
        </AppText>
      )}
      {right ?? (onPress && <Icon name="chevron-forward" size={18} />)}
    </>
  );

  if (!onPress) return <View style={styles.row}>{content}</View>;

  return (
    <PressableScale pressedScale={0.98} onPress={onPress} accessibilityRole="button" style={styles.row}>
      {content}
    </PressableScale>
  );
}

interface SwitchRowProps {
  icon?: IconName;
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

/** Hàng danh sách có công tắc bật/tắt. */
export function SwitchRow({ icon, title, subtitle, value, onValueChange }: SwitchRowProps) {
  const { colors } = useAppTheme();
  return (
    <ListRow
      icon={icon}
      title={title}
      subtitle={subtitle}
      right={
        <Switch
          value={value}
          onValueChange={onValueChange}
          accessibilityLabel={title}
          trackColor={{ false: colors.outline, true: colors.primary }}
          thumbColor={colors.surface}
        />
      }
    />
  );
}

/** Nhóm các hàng trên nền thẻ tonal, phân tách bằng khoảng trắng thay vì đường kẻ. */
export function ListGroup({ children }: { children: ReactNode }) {
  const { colors } = useAppTheme();
  return <View style={[styles.group, { backgroundColor: colors.surface }]}>{children}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 56,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  texts: { flex: 1, gap: 2 },
  group: { borderRadius: radius.md, paddingVertical: spacing.xs, overflow: 'hidden' },
});
