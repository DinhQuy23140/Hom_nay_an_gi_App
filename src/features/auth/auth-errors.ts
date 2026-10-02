import { FirebaseError } from 'firebase/app';

/** Lỗi đã có thông điệp thân thiện, hiển thị thẳng cho người dùng. */
export class AuthError extends Error {}

const FIREBASE_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Email hoặc mật khẩu chưa đúng.',
  'auth/wrong-password': 'Email hoặc mật khẩu chưa đúng.',
  'auth/user-not-found': 'Không tìm thấy tài khoản với email này.',
  'auth/invalid-email': 'Email không hợp lệ.',
  'auth/email-already-in-use': 'Email này đã được đăng ký. Bạn thử đăng nhập nhé.',
  'auth/weak-password': 'Mật khẩu quá yếu, hãy dùng ít nhất 8 ký tự.',
  'auth/too-many-requests': 'Bạn thử quá nhiều lần. Đợi một lát rồi thử lại nhé.',
  'auth/network-request-failed': 'Không có kết nối mạng. Kiểm tra lại rồi thử lại nhé.',
  'auth/account-exists-with-different-credential':
    'Email này đã đăng ký bằng cách khác. Hãy đăng nhập bằng email và mật khẩu.',
  'auth/user-disabled': 'Tài khoản này đã bị khóa.',
};

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof AuthError) return error.message;
  if (error instanceof FirebaseError) {
    return FIREBASE_MESSAGES[error.code] ?? 'Có lỗi xảy ra. Bạn thử lại sau nhé.';
  }
  return 'Có lỗi xảy ra. Bạn thử lại sau nhé.';
}
