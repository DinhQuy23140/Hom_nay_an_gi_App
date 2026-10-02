import 'react-native-url-polyfill/auto';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { env } from './env';
import { getFirebaseAuth } from './firebase';

let client: SupabaseClient | undefined;

/**
 * Supabase chỉ dùng cho Storage. Xác thực đi qua Firebase (Supabase Third-party Auth),
 * nên mỗi request gửi kèm Firebase ID token của người dùng hiện tại.
 */
export function getSupabase(): SupabaseClient {
  client ??= createClient(env.supabase.url, env.supabase.anonKey, {
    accessToken: async () => (await getFirebaseAuth().currentUser?.getIdToken()) ?? null,
  });
  return client;
}

export function getPublicStorageUrl(path: string): string | null {
  if (!env.supabase.url) return null;
  return `${env.supabase.url}/storage/v1/object/public/${env.supabase.bucket}/${path}`;
}
