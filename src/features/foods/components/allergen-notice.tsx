import { StyleSheet, View } from 'react-native';

import { AppText, Icon } from '@/components/ui';
import type { DietaryRestrictions } from '@/features/profile/types';
import { radius, spacing, useAppTheme } from '@/theme';

import { ALLERGENS } from '../data/taxonomy';
import type { Food } from '../types';

interface AllergenNoticeProps {
  food: Food;
  restrictions: DietaryRestrictions;
}

/** Cảnh báo dị ứng; nổi bật khi trùng với dị ứng người dùng đã khai báo. */
export function AllergenNotice({ food, restrictions }: AllergenNoticeProps) {
  const { colors } = useAppTheme();
  if (!food.allergens.length) return null;

  const conflicts = food.allergens.filter((a) => restrictions.allergens.includes(a));
  const danger = conflicts.length > 0;
  const names = (danger ? conflicts : food.allergens).map((a) => ALLERGENS[a]).join(', ');

  return (
    <View
      accessibilityRole="alert"
      style={[styles.box, { backgroundColor: danger ? colors.errorContainer : colors.surfaceVariant }]}>
      <Icon
        name={danger ? 'warning-outline' : 'information-circle-outline'}
        size={20}
        color={danger ? 'onErrorContainer' : 'onSurfaceVariant'}
      />
      <View style={styles.texts}>
        <AppText variant="label" color={danger ? 'onErrorContainer' : 'onSurface'}>
          {danger ? `Có thành phần bạn dị ứng: ${names}` : `Có thể chứa: ${names}`}
        </AppText>
        <AppText variant="caption" color={danger ? 'onErrorContainer' : 'onSurfaceVariant'}>
          Thông tin tham khảo theo công thức phổ biến; hãy hỏi lại quán trước khi gọi món.
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md },
  texts: { flex: 1, gap: 2 },
});
