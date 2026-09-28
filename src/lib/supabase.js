import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

export const supabase = supabaseConfigured
  ? createClient(url, anonKey)
  : null;

export async function sendPhoneOtp(phone) {
  if (!supabase) throw new Error('Supabase is not configured yet.');
  return supabase.auth.signInWithOtp({ phone });
}

export async function verifyPhoneOtp(phone, token) {
  if (!supabase) throw new Error('Supabase is not configured yet.');
  return supabase.auth.verifyOtp({ phone, token, type: 'sms' });
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}
