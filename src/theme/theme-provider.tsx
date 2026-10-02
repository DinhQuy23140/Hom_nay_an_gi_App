import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider, type Theme } from 'expo-router';
import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';

import { useSettingsStore } from '@/features/settings/settings.store';

import { fontFamily, gradients, palette, type ColorTokens, type GradientTokens } from './tokens';

interface AppTheme {
  colors: ColorTokens;
  gradients: GradientTokens;
  isDark: boolean;
}

const ThemeContext = createContext<AppTheme>({ colors: palette.light, gradients: gradients.light, isDark: false });

export function AppThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const themeMode = useSettingsStore((s) => s.themeMode);
  const isDark = themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';

  const value = useMemo<AppTheme>(
    () => ({
      colors: isDark ? palette.dark : palette.light,
      gradients: isDark ? gradients.dark : gradients.light,
      isDark,
    }),
    [isDark],
  );

  const navigationTheme = useMemo<Theme>(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: value.colors.primary,
        background: value.colors.background,
        card: value.colors.surface,
        text: value.colors.onSurface,
        border: value.colors.outline,
        notification: value.colors.error,
      },
      fonts: {
        regular: { fontFamily: fontFamily.regular, fontWeight: '400' },
        medium: { fontFamily: fontFamily.medium, fontWeight: '500' },
        bold: { fontFamily: fontFamily.semibold, fontWeight: '600' },
        heavy: { fontFamily: fontFamily.semibold, fontWeight: '600' },
      },
    };
  }, [isDark, value.colors]);

  return (
    <ThemeContext.Provider value={value}>
      <NavigationThemeProvider value={navigationTheme}>{children}</NavigationThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): AppTheme {
  return useContext(ThemeContext);
}
