import { useReducedMotion } from 'react-native-reanimated';

import { useSettingsStore } from '@/features/settings/settings.store';

/** Gộp cài đặt "Giảm chuyển động" của hệ thống và của app. */
export function useMotion() {
  const systemReduced = useReducedMotion();
  const appReduced = useSettingsStore((s) => s.reduceMotion);
  const reduced = systemReduced || appReduced;

  return {
    reduced,
    /** Trả về animation khi được phép, ngược lại không animate. */
    pick<T>(animation: T): T | undefined {
      return reduced ? undefined : animation;
    },
  };
}
