import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Chip, type IconName } from '@/components/ui';
import type { Level } from '@/features/foods/types';
import { BUDGET_PRESETS } from '@/features/recommendation/filters.store';
import { spacing } from '@/theme';

export const SPICY_LABELS = ['Không cay', 'Hơi cay', 'Cay vừa', 'Rất cay'] as const;
const LEVELS: Level[] = [0, 1, 2, 3];

type Option = string | { label: string; icon: IconName };

/** Khung xếp chip tự xuống dòng. */
export function ChipWrap({ children }: PropsWithChildren) {
  return <View style={styles.wrap}>{children}</View>;
}

/** Khối chỉnh sửa có tiêu đề và gợi ý. */
export function EditorSection({ title, hint, children }: PropsWithChildren<{ title: string; hint?: string }>) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionTitle}>
        <AppText variant="title">{title}</AppText>
        {hint && (
          <AppText variant="bodySmall" color="onSurfaceVariant">
            {hint}
          </AppText>
        )}
      </View>
      {children}
    </View>
  );
}

interface MultiChipSelectProps<T extends string> {
  options: Record<T, Option>;
  value: readonly T[];
  onChange: (next: T[]) => void;
  tone?: 'primary' | 'secondary' | 'error';
}

/** Nhóm chip cho phép chọn nhiều giá trị. */
export function MultiChipSelect<T extends string>({ options, value, onChange, tone }: MultiChipSelectProps<T>) {
  const keys = Object.keys(options) as T[];
  return (
    <ChipWrap>
      {keys.map((key) => {
        const option = options[key];
        const selected = value.includes(key);
        return (
          <Chip
            key={key}
            label={typeof option === 'string' ? option : option.label}
            icon={typeof option === 'string' ? undefined : option.icon}
            tone={tone}
            selected={selected}
            onPress={() => onChange(selected ? value.filter((v) => v !== key) : [...value, key])}
          />
        );
      })}
    </ChipWrap>
  );
}

/** Bộ chọn mức cay 0–3. */
export function SpicyPicker({ value, onChange }: { value: Level; onChange: (level: Level) => void }) {
  return (
    <ChipWrap>
      {LEVELS.map((level) => (
        <Chip
          key={level}
          label={SPICY_LABELS[level]}
          icon={level === 0 ? 'leaf-outline' : 'flame-outline'}
          selected={value === level}
          onPress={() => onChange(level)}
        />
      ))}
    </ChipWrap>
  );
}

/** Bộ chọn mức ngân sách mỗi bữa. */
export function BudgetPicker({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (budget: number | null) => void;
}) {
  return (
    <ChipWrap>
      {BUDGET_PRESETS.map((preset) => (
        <Chip
          key={preset.id}
          label={preset.max ? `${preset.label} · ≤${preset.max / 1000}k` : preset.label}
          tone="secondary"
          selected={value === preset.max}
          onPress={() => onChange(preset.max)}
        />
      ))}
    </ChipWrap>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  section: { gap: spacing.md },
  sectionTitle: { gap: spacing.xs },
});
