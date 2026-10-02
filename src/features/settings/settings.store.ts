import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { kvStorage } from '@/lib/kv-storage';

export type ThemeMode = 'system' | 'light' | 'dark';

interface SettingsState {
  themeMode: ThemeMode;
  reduceMotion: boolean;
  haptics: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setReduceMotion: (value: boolean) => void;
  setHaptics: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themeMode: 'system',
      reduceMotion: false,
      haptics: true,
      setThemeMode: (themeMode) => set({ themeMode }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      setHaptics: (haptics) => set({ haptics }),
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => kvStorage),
      partialize: ({ themeMode, reduceMotion, haptics }) => ({ themeMode, reduceMotion, haptics }),
    },
  ),
);
