import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui';
import { haptics } from '@/lib/haptics';

const STARS = [1, 2, 3, 4, 5];

interface RatingStarsProps {
  value: number;
  size?: number;
  onChange?: (value: number) => void;
}

/** Dãy sao đánh giá: chỉ hiển thị, hoặc bấm để chấm điểm khi có `onChange`. */
export function RatingStars({ value, size = 16, onChange }: RatingStarsProps) {
  if (!onChange) {
    return (
      <View style={styles.row} accessible accessibilityLabel={`${value} trên 5 sao`}>
        {STARS.map((star) => (
          <Icon key={star} name={star <= value ? 'star' : 'star-outline'} size={size} color="tertiary" />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.row} accessibilityRole="adjustable" accessibilityValue={{ min: 1, max: 5, now: value }}>
      {STARS.map((star) => (
        <Pressable
          key={star}
          hitSlop={6}
          onPress={() => {
            haptics.tap();
            onChange(star);
          }}
          accessibilityRole="button"
          accessibilityLabel={`${star} sao`}>
          <Icon name={star <= value ? 'star' : 'star-outline'} size={size} color="tertiary" />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4 },
});
