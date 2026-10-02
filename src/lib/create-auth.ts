import type { FirebaseApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth';

import { kvStorage } from './kv-storage';

/** Native: lưu phiên đăng nhập vào kv-store để mở lại app không phải đăng nhập lại. */
export function createAuth(app: FirebaseApp): Auth {
  try {
    return initializeAuth(app, { persistence: getReactNativePersistence(kvStorage) });
  } catch {
    // Fast Refresh chạy lại module sau khi Auth đã được khởi tạo.
    return getAuth(app);
  }
}
