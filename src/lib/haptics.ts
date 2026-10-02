import * as Haptics from 'expo-haptics';

import { useSettingsStore } from '@/features/settings/settings.store';

function enabled() {
  return useSettingsStore.getState().haptics;
}

export const haptics = {
  tap() {
    if (enabled()) void Haptics.selectionAsync();
  },
  impact() {
    if (enabled()) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },
  success() {
    if (enabled()) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },
  warning() {
    if (enabled()) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },
};
