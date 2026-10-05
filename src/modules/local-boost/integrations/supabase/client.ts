import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { detectAuthSessionFor } from '@/modules/shared/auth-callback';

// Public project configuration only. Each original backend retains its own session and RLS.
const url = "https://ydnyoqfikiybyektvann.supabase.co";
const publishableKey = "sb_publishable_3dsO7_wOCPBDcS5VxkjPsA_GyiFXIsa";
export const supabase = createClient<Database>(url, publishableKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: detectAuthSessionFor('local-boost') },
  global: { fetch: (input, init) => {
    const headers = new Headers(typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined);
    new Headers(init?.headers).forEach((value, key) => headers.set(key, value));
    if (publishableKey.startsWith('sb_publishable_') && headers.get('Authorization') === 'Bearer ' + publishableKey) headers.delete('Authorization');
    headers.set('apikey', publishableKey);
    return fetch(input, { ...init, headers });
  } },
});
