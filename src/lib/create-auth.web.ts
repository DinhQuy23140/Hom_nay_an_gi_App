import type { FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

/** Web: getAuth mặc định đã lưu phiên vào IndexedDB của trình duyệt. */
export function createAuth(app: FirebaseApp): Auth {
  return getAuth(app);
}
