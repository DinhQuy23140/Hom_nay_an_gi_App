import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import { useAuth } from '@/features/auth/auth-provider';
import { subscribeFavorites } from '@/features/favorites/favorites.service';
import { subscribeHistory } from '@/features/history/history.service';
import type { InteractionEvent } from '@/features/history/types';

import { subscribeProfile } from './profile.service';
import type { UserProfile } from './types';

interface UserData {
  profile: UserProfile | null;
  profileLoading: boolean;
  profileError: boolean;
  favorites: ReadonlySet<string>;
  history: readonly InteractionEvent[];
}

interface Snapshot {
  uid: string;
  profile?: UserProfile;
  profileError?: boolean;
  favorites?: ReadonlySet<string>;
  history?: InteractionEvent[];
}

const EMPTY_SET: ReadonlySet<string> = new Set();
const EMPTY_HISTORY: readonly InteractionEvent[] = [];

const UserDataContext = createContext<UserData>({
  profile: null,
  profileLoading: false,
  profileError: false,
  favorites: EMPTY_SET,
  history: EMPTY_HISTORY,
});

/** Giữ một kết nối realtime duy nhất tới dữ liệu cá nhân cho toàn app. */
export function UserDataProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    const patch = (next: Omit<Snapshot, 'uid'>) =>
      setSnapshot((prev) => ({ ...(prev?.uid === uid ? prev : { uid }), ...next }));

    const unsubscribers = [
      subscribeProfile(
        user,
        (profile) => patch({ profile, profileError: false }),
        () => patch({ profileError: true }),
      ),
      subscribeFavorites(uid, (slugs) => patch({ favorites: new Set(slugs) })),
      subscribeHistory(uid, (history) => patch({ history })),
    ];
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [user]);

  const current = user && snapshot?.uid === user.uid ? snapshot : null;

  const value: UserData = {
    profile: current?.profile ?? null,
    profileError: current?.profileError ?? false,
    profileLoading: !!user && !current?.profile && !current?.profileError,
    favorites: current?.favorites ?? EMPTY_SET,
    history: current?.history ?? EMPTY_HISTORY,
  };

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}

/** Lấy hồ sơ, món yêu thích và lịch sử của người dùng hiện tại. */
export function useUserData(): UserData {
  return useContext(UserDataContext);
}

/** Dùng trong các màn đã qua guard đăng nhập + onboarding, nơi hồ sơ chắc chắn tồn tại. */
export function useProfile(): UserProfile {
  const { profile } = useUserData();
  if (!profile) throw new Error('useProfile() được gọi khi chưa có hồ sơ người dùng.');
  return profile;
}
