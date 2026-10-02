import { useState } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';

import { AppText, Chip, EmptyState, Icon, Screen, ScreenHeader } from '@/components/ui';
import { FoodCardCompact } from '@/features/foods/components/food-card';
import { foodRepository } from '@/features/foods/food-repository';
import type { InteractionEvent, InteractionType } from '@/features/history/types';
import { useUserData } from '@/features/profile/user-data-provider';
import { spacing } from '@/theme';

const FILTERS: { type: InteractionType; label: string }[] = [
  { type: 'SELECT', label: 'Đã chốt' },
  { type: 'VIEW', label: 'Đã xem' },
  { type: 'DISLIKE', label: 'Không thích' },
];

function dayLabel(date: Date, now = new Date()) {
  const start = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((start(now) - start(date)) / 86_400_000);
  if (days === 0) return 'Hôm nay';
  if (days === 1) return 'Hôm qua';
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

function formatTime(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function groupByDay(events: readonly InteractionEvent[]) {
  const sections: { title: string; data: InteractionEvent[] }[] = [];
  for (const event of events) {
    const title = dayLabel(event.createdAt);
    const last = sections[sections.length - 1];
    if (last?.title === title) last.data.push(event);
    else sections.push({ title, data: [event] });
  }
  return sections;
}

/** Màn Lịch sử ăn uống (/history): sự kiện nhóm theo ngày, lọc theo loại. */
export default function HistoryScreen() {
  const { history } = useUserData();
  const [type, setType] = useState<InteractionType>('SELECT');
  const sections = groupByDay(
    history.filter((e) => e.type === type && foodRepository.bySlug(e.slug)),
  );

  return (
    <Screen padded={false} header={<ScreenHeader title="Lịch sử ăn uống" />}>
      <View style={styles.filters}>
        {FILTERS.map((filter) => (
          <Chip
            key={filter.type}
            label={filter.label}
            selected={type === filter.type}
            onPress={() => setType(filter.type)}
          />
        ))}
      </View>
      <SectionList
        sections={sections}
        keyExtractor={(event) => event.id}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <AppText variant="label" color="onSurfaceVariant" style={styles.sectionTitle}>
            {section.title}
          </AppText>
        )}
        renderItem={({ item }) => {
          const food = foodRepository.bySlug(item.slug);
          if (!food) return null;
          return (
            <FoodCardCompact
              food={food}
              trailing={
                <View style={styles.time}>
                  <Icon name="time-outline" size={14} />
                  <AppText variant="caption" color="onSurfaceVariant" tabular>
                    {formatTime(item.createdAt)}
                  </AppText>
                </View>
              }
            />
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="time-outline"
            title="Chưa có lịch sử"
            message="Các món bạn chốt, xem hoặc bỏ qua sẽ hiện ở đây để gợi ý ngày càng hợp gu."
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.screen, paddingBottom: spacing.sm },
  list: { paddingHorizontal: spacing.screen, paddingBottom: spacing.xxl },
  sectionTitle: { paddingTop: spacing.lg, paddingBottom: spacing.xs },
  time: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
