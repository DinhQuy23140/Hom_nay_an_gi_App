import { TurboModuleRegistry } from 'react-native';

import { env, isGoogleSignInConfigured } from '@/lib/env';

import { AuthError } from '../auth-errors';

type GoogleSignInModule = typeof import('@react-native-google-signin/google-signin');

let cached: GoogleSignInModule | null | undefined;
let configured = false;

/**
 * Module native chỉ có trong development build; Expo Go không có,
 * nên nạp lười để phần còn lại của app vẫn chạy được.
 */
function loadModule(): GoogleSignInModule | null {
  if (cached !== undefined) return cached;
  // require() một module thiếu native sẽ ném lỗi qua LogBox dù đã try/catch.
  if (!TurboModuleRegistry.get('RNGoogleSignin')) {
    cached = null;
    return cached;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cached = require('@react-native-google-signin/google-signin') as GoogleSignInModule;
  } catch {
    cached = null;
  }
  return cached;
}

export function isGoogleSignInAvailable(): boolean {
  return isGoogleSignInConfigured && loadModule() !== null;
}

/** Mở hộp thoại chọn tài khoản Google và trả về ID token, hoặc null nếu người dùng hủy. */
export async function getGoogleIdToken(): Promise<string | null> {
  const mod = loadModule();
  if (!mod) {
    throw new AuthError('Đăng nhập Google cần bản development build (npx expo run:android).');
  }
  if (!isGoogleSignInConfigured) {
    throw new AuthError('Chưa cấu hình Google Sign-In (EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID).');
  }

  const { GoogleSignin, isSuccessResponse, isErrorWithCode, statusCodes } = mod;
  if (!configured) {
    GoogleSignin.configure({ webClientId: env.googleWebClientId });
    configured = true;
  }

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) return null;
    if (!response.data.idToken) throw new AuthError('Google không trả về ID token.');
    return response.data.idToken;
  } catch (error) {
    if (isErrorWithCode(error)) {
      if (error.code === statusCodes.IN_PROGRESS) return null;
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new AuthError('Thiết bị chưa có Google Play Services.');
      }
    }
    throw error;
  }
}

export async function signOutGoogle(): Promise<void> {
  if (!configured) return;
  const mod = loadModule();
  if (!mod) return;
  try {
    await mod.GoogleSignin.signOut();
  } catch {
    // Không có phiên Google nào để đăng xuất.
  }
}
