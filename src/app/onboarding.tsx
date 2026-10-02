import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { FormMessage } from '@/components/form/form-message';
import { AppText, Button, Gradient, Screen } from '@/components/ui';
import { useAuth } from '@/features/auth/auth-provider';
import { ALLERGENS, CUISINES, DIETS, DISH_TYPES } from '@/features/foods/data/taxonomy';
import {
  BudgetPicker,
  EditorSection,
  MultiChipSelect,
  SpicyPicker,
} from '@/features/profile/components/taste-editors';
import { completeOnboarding } from '@/features/profile/profile.service';
import {
  DEFAULT_PREFERENCES,
  DEFAULT_RESTRICTIONS,
  type DietaryRestrictions,
  type TastePreferences,
} from '@/features/profile/types';
import { useUserData } from '@/features/profile/user-data-provider';
import { useAsyncAction } from '@/hooks/use-async-action';
import { haptics } from '@/lib/haptics';
import { motion, radius, spacing, useAppTheme, useMotion } from '@/theme';

const TOTAL_STEPS = 4;
const toMessage = () => 'Chưa lưu được khẩu vị. Kiểm tra mạng rồi thử lại nhé.';

/** Màn Quiz khẩu vị (/onboarding): 4 bước, hiện sau lần đăng ký đầu tiên. */
export default function OnboardingScreen() {
  const { user } = useAuth();
  const { profile } = useUserData();
  const { pick } = useMotion();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [prefs, setPrefs] = useState<TastePreferences>(profile?.preferences ?? DEFAULT_PREFERENCES);
  const [restrictions, setRestrictions] = useState<DietaryRestrictions>(
    profile?.restrictions ?? DEFAULT_RESTRICTIONS,
  );
  const { run, pending, error } = useAsyncAction(toMessage);

  const isLast = step === TOTAL_STEPS - 1;
  const firstName = profile?.displayName?.split(' ').pop();

  const go = (delta: 1 | -1) => {
    haptics.tap();
    setDirection(delta);
    setStep((s) => s + delta);
  };

  const finish = () => {
    if (!user) return;
    void run(async () => {
      await completeOnboarding(user.uid, prefs, restrictions);
      haptics.success();
    });
  };

  const entering = pick(
    (direction === 1 ? SlideInRight : SlideInLeft).duration(motion.duration.normal).easing(motion.easing),
  );
  const exiting = pick((direction === 1 ? SlideOutLeft : SlideOutRight).duration(motion.duration.fast));

  return (
    <Screen
      edges={['top']}
      padded={false}
      footer={
        <View style={styles.footer}>
          <FormMessage message={error} />
          <View style={styles.footerRow}>
            {step > 0 && <Button label="Quay lại" variant="text" compact onPress={() => go(-1)} />}
            <Button
              label={isLast ? 'Xong, gợi ý món thôi' : 'Tiếp tục'}
              icon={isLast ? 'sparkles-outline' : undefined}
              loading={pending}
              style={styles.next}
              onPress={isLast ? finish : () => go(1)}
            />
          </View>
        </View>
      }>
      <View style={styles.top}>
        <ProgressBar progress={(step + 1) / TOTAL_STEPS} />
        <AppText variant="caption" color="onSurfaceVariant">
          Bước {step + 1}/{TOTAL_STEPS}
        </AppText>
      </View>

      <Animated.View key={step} entering={entering} exiting={exiting} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {step === 0 && (
            <>
              <AppText variant="headline">
                {firstName ? `Chào ${firstName}! ` : ''}Bạn có kiêng gì không?
              </AppText>
              <EditorSection
                title="Dị ứng"
                hint="Món có thành phần này sẽ bị loại hẳn khỏi gợi ý.">
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
            </>
          )}

          {step === 1 && (
            <>
              <AppText variant="headline">Ăn cay và chi tiêu thế nào?</AppText>
              <EditorSection title="Mức cay">
                <SpicyPicker
                  value={prefs.spicyLevel}
                  onChange={(spicyLevel) => setPrefs((p) => ({ ...p, spicyLevel }))}
                />
              </EditorSection>
              <EditorSection title="Ngân sách mỗi bữa" hint="Có thể đổi nhanh trong bộ lọc khi random.">
                <BudgetPicker
                  value={prefs.budgetMax}
                  onChange={(budgetMax) => setPrefs((p) => ({ ...p, budgetMax }))}
                />
              </EditorSection>
            </>
          )}

          {step === 2 && (
            <>
              <AppText variant="headline">Bạn mê ẩm thực nào?</AppText>
              <EditorSection title="Chọn bao nhiêu cũng được" hint="Bỏ trống nếu bạn ăn gì cũng được.">
                <MultiChipSelect
                  options={CUISINES}
                  value={prefs.cuisines}
                  onChange={(cuisines) => setPrefs((p) => ({ ...p, cuisines }))}
                />
              </EditorSection>
            </>
          )}

          {step === 3 && (
            <>
              <AppText variant="headline">Kiểu món bạn hay thèm?</AppText>
              <EditorSection title="Món yêu thích" hint="Mình sẽ ưu tiên gợi ý các kiểu món này.">
                <MultiChipSelect
                  options={DISH_TYPES}
                  tone="secondary"
                  value={prefs.dishTypes}
                  onChange={(dishTypes) => setPrefs((p) => ({ ...p, dishTypes }))}
                />
              </EditorSection>
            </>
          )}
        </ScrollView>
      </Animated.View>
    </Screen>
  );
}

/** Thanh tiến trình các bước quiz. */
function ProgressBar({ progress }: { progress: number }) {
  const { colors } = useAppTheme();
  const { reduced } = useMotion();
  const fill = useAnimatedStyle(() => ({
    width: reduced
      ? `${progress * 100}%`
      : withTiming(`${progress * 100}%`, { duration: motion.duration.slow, easing: motion.easing }),
  }));
  return (
    <View style={[styles.track, { backgroundColor: colors.surfaceVariant }]}>
      <Animated.View style={[styles.fill, fill]}>
        <Gradient name="fresh" direction="horizontal" fill />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { paddingHorizontal: spacing.screen, paddingTop: spacing.md, gap: spacing.sm },
  content: { padding: spacing.screen, gap: spacing.lg, paddingBottom: spacing.xxl },
  track: { height: 6, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill, overflow: 'hidden' },
  footer: { gap: spacing.sm },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  next: { flex: 1 },
});
