import { StyleSheet, View } from 'react-native';

import { AppText, Gradient, Icon, PressableScale, type IconName } from '@/components/ui';
import type { Food } from '@/features/foods/types';
import { radius, spacing, type ColorName, type GradientName } from '@/theme';

import { openDelivery, openMapsSearch, openRecipe } from '../external-links';

interface Action {
  key: 'go' | 'cook' | 'delivery';
  label: string;
  icon: IconName;
  bg: GradientName;
  fg: ColorName;
  run: (food: Food) => Promise<unknown>;
}

const ACTIONS: Action[] = [
  { key: 'go', label: 'Ra quán', icon: 'map-outline', bg: 'leaf', fg: 'primaryText', run: openMapsSearch },
  { key: 'cook', label: 'Tự nấu', icon: 'flame-outline', bg: 'lavender', fg: 'dessert', run: openRecipe },
  { key: 'delivery', label: 'Đặt giao', icon: 'bicycle-outline', bg: 'lagoon', fg: 'secondaryText', run: openDelivery },
];

interface FoodActionsProps {
  food: Food;
  /** Gọi trước khi mở link ngoài, dùng để ghi nhận món đã chốt. */
  onAction?: (key: Action['key']) => void;
}

/** Ba ô hành động Ra quán / Tự nấu / Đặt giao. */
export function FoodActions({ food, onAction }: FoodActionsProps) {
  return (
    <View style={styles.row}>
      {ACTIONS.map((action) => (
        <PressableScale
          key={action.key}
          haptic
          onPress={() => {
            onAction?.(action.key);
            void action.run(food).catch(() => undefined);
          }}
          accessibilityRole="button"
          accessibilityLabel={`${action.label}: ${food.nameVi}`}
          style={styles.tile}>
          <Gradient name={action.bg} fill />
          <Icon name={action.icon} size={26} color={action.fg} />
          <AppText variant="label" color={action.fg}>
            {action.label}
          </AppText>
        </PressableScale>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  tile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
});
