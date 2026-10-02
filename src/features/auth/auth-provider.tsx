import { onAuthStateChanged, type User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import { getFirebaseAuth } from '@/lib/firebase';

interface AuthState {
  user: User | null;
  initializing: boolean;
}

const AuthContext = createContext<AuthState>({ user: null, initializing: true });

/** Provider trạng thái đăng nhập Firebase cho toàn app. */
export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>({ user: null, initializing: true });

  useEffect(
    () => onAuthStateChanged(getFirebaseAuth(), (user) => setState({ user, initializing: false })),
    [],
  );

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

/** Lấy người dùng hiện tại và trạng thái khởi tạo phiên. */
export function useAuth(): AuthState {
  return useContext(AuthContext);
}
