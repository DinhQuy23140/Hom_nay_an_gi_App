import { useAuth } from '@/features/auth/auth-provider';
import { logInteraction } from '@/features/history/history.service';
import { useUserData } from '@/features/profile/user-data-provider';
import { haptics } from '@/lib/haptics';

import { setFavorite } from './favorites.service';

export function useFavorites() {
  const { user } = useAuth();
  const { favorites } = useUserData();

  const toggle = (slug: string) => {
    if (!user) return;
    const next = !favorites.has(slug);
    haptics.impact();
    // Firestore áp dụng ghi cục bộ ngay, nên UI cập nhật tức thì kể cả khi offline.
    void setFavorite(user.uid, slug, next);
    if (next) void logInteraction(user.uid, 'LIKE', slug, 'detail').catch(() => undefined);
  };

  return {
    favorites,
    isFavorite: (slug: string) => favorites.has(slug),
    toggle,
  };
}
