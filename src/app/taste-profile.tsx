import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { FormMessage } from '@/components/form/form-message';
import { Button, Screen, ScreenHeader } from '@/components/ui';
import { ALLERGENS, CUISINES, DIETS, DISH_TYPES } from '@/features/foods/data/taxonomy';
import {
  BudgetPicker,
  EditorSection,
  MultiChipSelect,
  SpicyPicker,
} from '@/features/profile/components/taste-editors';
import { updatePreferences, updateRestrictions } from '@/features/profile/profile.service';
import { useProfile } from '@/features/profile/user-data-provider';
import { useAsyncAction } from '@/hooks/use-async-action';
import { haptics } from '@/lib/haptics';
import { spacing } from '@/theme';

const toMessage = () => 'Chưa lưu được. Kiểm tra mạng rồi thử lại nhé.';

/** Màn Hồ sơ khẩu vị (/taste-profile): sửa dị ứng, chế độ ăn, mức cay, ngân sách, sở thích. */
export default function TasteProfileScreen() {
  const profile = useProfile();
  const [prefs, setPrefs] = useState(profile.preferences);
  const [restrictions, setRestrictions] = useState(profile.restrictions);
  const { run, pending, error } = useAsyncAction(toMessage);

  const dirty =
    JSON.stringify(prefs) !== JSON.stringify(profile.preferences) ||
    JSON.stringify(restrictions) !== JSON.stringify(profile.restrictions);

  const save = () =>
    run(async () => {
      await Promise.all([
        updatePreferences(profile.uid, prefs),
        updateRestrictions(profile.uid, restrictions),
      ]);
      haptics.success();
      router.back();
    });

  return (
    <Screen
      scroll
      header={<ScreenHeader title="Hồ sơ khẩu vị" />}
      contentStyle={styles.content}
      footer={<Button label="Lưu thay đổi" disabled={!dirty} loading={pending} onPress={() => void save()} />}>
      <EditorSection title="Dị ứng" hint="Món chứa các thành phần này sẽ không bao giờ được gợi ý.">
        <MultiChipSelect
          options={ALLERGENS}
          tone="error"
          value={restrictions.allergens}
          onChange={(allergens) => setRestrictions((r) => ({ ...r, allergens }))}
        />
      </EditorSection>
      <EditorSection title="Chế độ ăn">
        <MultiChipSelect
          options={DIETS}
          value={restrictions.diets}
          onChange={(diets) => setRestrictions((r) => ({ ...r, diets }))}
        />
      </EditorSection>
      <EditorSection title="Mức cay">
        <SpicyPicker value={prefs.spicyLevel} onChange={(spicyLevel) => setPrefs((p) => ({ ...p, spicyLevel }))} />
      </EditorSection>
      <EditorSection title="Ngân sách mỗi bữa">
        <BudgetPicker value={prefs.budgetMax} onChange={(budgetMax) => setPrefs((p) => ({ ...p, budgetMax }))} />
      </EditorSection>
      <EditorSection title="Ẩm thực yêu thích">
        <MultiChipSelect
          options={CUISINES}
          value={prefs.cuisines}
          onChange={(cuisines) => setPrefs((p) => ({ ...p, cuisines }))}
        />
      </EditorSection>
      <EditorSection title="Kiểu món hay thèm">
        <MultiChipSelect
          options={DISH_TYPES}
          tone="secondary"
          value={prefs.dishTypes}
          onChange={(dishTypes) => setPrefs((p) => ({ ...p, dishTypes }))}
        />
      </EditorSection>
      <FormMessage message={error} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.xl, paddingTop: spacing.sm },
});
