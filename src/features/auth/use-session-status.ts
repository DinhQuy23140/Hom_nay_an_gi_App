import { useUserData } from '@/features/profile/user-data-provider';

import { useAuth } from './auth-provider';

export type SessionStatus = 'loading' | 'signedOut' | 'onboarding' | 'ready' | 'error';

export function useSessionStatus(): SessionStatus {
  const { user, initializing } = useAuth();
  const { profile, profileLoading, profileError } = useUserData();

  if (initializing) return 'loading';
  if (!user) return 'signedOut';
  if (profileError) return 'error';
  if (profileLoading || !profile) return 'loading';
  return profile.onboarded ? 'ready' : 'onboarding';
}
