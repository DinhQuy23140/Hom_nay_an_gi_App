import { Easing } from 'react-native-reanimated';

/**
 * Dải xanh lá thương hiệu (đậm → nhạt):
 * #143601 · #1a4301 · #245501 · #538d22 · #73a942 · #aad576.
 * Phối thêm xanh ngọc (đồ uống), oải hương (tráng miệng) và nền xám ánh rêu.
 */
const light = {
  primary: '#538D22',
  onPrimary: '#FFFFFF',
  primaryContainer: '#E6F2D6',
  primaryText: '#245501',
  secondary: '#2A9D8F',
  secondaryContainer: '#DDF1EE',
  secondaryText: '#1B6B62',
  tertiary: '#FFD84D',
  dessert: '#6E5FC8',
  dessertContainer: '#EDEAFB',
  background: '#F2F6F1',
  surface: '#FFFFFF',
  surfaceVariant: '#EEF3EC',
  onSurface: '#14200F',
  onSurfaceVariant: '#5A6855',
  outline: '#DCE5D8',
  error: '#E5484D',
  errorContainer: '#FFE8E8',
  onErrorContainer: '#9F1D22',
  sponsored: '#6B7280',
  scrim: 'rgba(20, 54, 1, 0.45)',
  white: '#FFFFFF',
};

export type ColorTokens = typeof light;
export type ColorName = keyof ColorTokens;

const dark: ColorTokens = {
  primary: '#73A942',
  onPrimary: '#FFFFFF',
  primaryContainer: '#1F3313',
  primaryText: '#AAD576',
  secondary: '#4FC1B2',
  secondaryContainer: '#123A36',
  secondaryText: '#8EDBD0',
  tertiary: '#FFE27A',
  dessert: '#B9ABFF',
  dessertContainer: '#29264A',
  background: '#0E150F',
  surface: '#172219',
  surfaceVariant: '#1F2C21',
  onSurface: '#E8F0E4',
  onSurfaceVariant: '#A0AF9B',
  outline: '#2C3A2D',
  error: '#FF8A8E',
  errorContainer: '#3D1A1C',
  onErrorContainer: '#FFB3B5',
  sponsored: '#9CA3AF',
  scrim: 'rgba(0, 0, 0, 0.55)',
  white: '#FFFFFF',
};

export const palette = { light, dark } as const;

type GradientStops = readonly [string, string, ...string[]];

const lightGradients = {
  /** Xanh rừng đậm: nút chính, nút Random, FAB, ô thống kê. Chữ trên nền này dùng `onPrimary` (trắng). */
  brand: ['#1A4301', '#245501', '#538D22'],
  /** Xanh lá tươi, không có chữ đè lên: thanh tiến trình, chấm chỉ trang. */
  fresh: ['#538D22', '#73A942', '#AAD576'],
  /** Nền màn hình: xám ánh rêu rất nhạt, hơi ngả lạnh. */
  background: ['#F7FAF6', '#EEF4EE', '#E6EEE8'],
  /** Thẻ nổi bật (thẻ gợi ý ở Trang chủ). */
  hero: ['#FFFFFF', '#F3F8EC'],
  /** Lá non: chip đang chọn, avatar, ảnh món chính, ô "Ra quán". */
  leaf: ['#EEF7E2', '#D9EDC2'],
  /** Lá → xanh ngọc: đồ uống, thời tiết, ô "Đặt giao". */
  lagoon: ['#E2F3E4', '#D3EEEA'],
  /** Oải hương: tráng miệng, ô "Tự nấu". */
  lavender: ['#EEEBFB', '#E4EEE6'],
} satisfies Record<string, GradientStops>;

export type GradientTokens = { [K in keyof typeof lightGradients]: GradientStops };
export type GradientName = keyof GradientTokens;

const darkGradients: GradientTokens = {
  brand: ['#245501', '#3D7212', '#538D22'],
  fresh: ['#538D22', '#73A942', '#AAD576'],
  background: ['#111A12', '#0E150F', '#0A100B'],
  hero: ['#1A261B', '#152017'],
  leaf: ['#22381A', '#1A2E14'],
  lagoon: ['#183424', '#123A36'],
  lavender: ['#29264A', '#1C2B22'],
};

export const gradients = { light: lightGradients, dark: darkGradients } as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  screen: 20,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  hero: 28,
  pill: 999,
} as const;

export const fontFamily = {
  regular: 'BeVietnamPro_400Regular',
  medium: 'BeVietnamPro_500Medium',
  semibold: 'BeVietnamPro_600SemiBold',
} as const;

export const typography = {
  display: { fontSize: 32, lineHeight: 40, fontFamily: fontFamily.semibold },
  headline: { fontSize: 24, lineHeight: 32, fontFamily: fontFamily.semibold },
  title: { fontSize: 18, lineHeight: 26, fontFamily: fontFamily.semibold },
  body: { fontSize: 15, lineHeight: 22, fontFamily: fontFamily.regular },
  bodyMedium: { fontSize: 15, lineHeight: 22, fontFamily: fontFamily.medium },
  bodySmall: { fontSize: 13, lineHeight: 18, fontFamily: fontFamily.regular },
  label: { fontSize: 14, lineHeight: 20, fontFamily: fontFamily.medium },
  caption: { fontSize: 12, lineHeight: 16, fontFamily: fontFamily.regular },
} as const;

export type TypographyVariant = keyof typeof typography;

export const motion = {
  duration: { fast: 150, normal: 220, slow: 300 },
  /** Material 3 "emphasized decelerate". */
  easing: Easing.bezier(0.05, 0.7, 0.1, 1),
  spring: { damping: 18, stiffness: 220, mass: 0.8 },
} as const;

export const sizes = {
  buttonHeight: 52,
  touchTarget: 48,
  tabBarHeight: 64,
  randomButton: 60,
} as const;
