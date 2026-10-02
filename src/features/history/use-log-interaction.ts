import { useAuth } from '@/features/auth/auth-provider';

import { logInteraction } from './history.service';
import type { InteractionSurface, InteractionType } from './types';

/** Ghi log hành vi kiểu fire-and-forget; lỗi ghi log không được làm gián đoạn trải nghiệm. */
export function useLogInteraction() {
  const { user } = useAuth();
  return (type: InteractionType, slug: string, surface: InteractionSurface) => {
    if (!user) return;
    logInteraction(user.uid, type, slug, surface).catch(() => undefined);
  };
}
