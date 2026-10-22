import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;
if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
export const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
export function userClient(token) {
  return createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false }
  });
}
