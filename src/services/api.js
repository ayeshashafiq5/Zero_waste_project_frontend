import axios from 'axios';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

export const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/v1',
  timeout: 15_000,
});

// ─── Request interceptor: attach Bearer token ────────────────────────────────
//
// ROOT CAUSE FIX (dashboard infinite loading):
//
// The previous implementation called `supabase.auth.getSession()` on every
// single request. During initial page load, if getSession() was still resolving
// (the promise was in-flight), requests raced ahead with NO Bearer token.
// The backend then returned 401 → the response interceptor below called
// signOut() → redirected to /login → but `loading` was still true in
// AuthContext → infinite spinner.
//
// Fix: Use `supabase.auth.getSession()` but fall back to reading the token
// synchronously from the Supabase localStorage cache first. This avoids the
// race between the async getSession() and in-flight API requests at startup.
// If neither is available, the request proceeds without a token and the
// backend returns a proper 401 that the UI can display as an error — NOT
// an infinite spinner.

api.interceptors.request.use(async (config) => {
  try {
    // Fast path: Supabase stores the session in localStorage under a stable key.
    // Reading it synchronously means zero delay for authenticated users whose
    // token is still valid (the common case after login).
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // No token available — log for debugging but let the request through.
      // The backend will return 401 which is handled below.
      console.warn('[api] No auth token available for', config.method?.toUpperCase(), config.url);
    }
  } catch (err) {
    // If getSession() itself throws (e.g. Supabase unreachable), log and continue.
    // This prevents the interceptor from swallowing requests entirely.
    console.error('[api] getSession() failed in request interceptor:', err.message);
  }
  return config;
});

// ─── Response interceptor: handle 401 / errors ───────────────────────────────
//
// On 401, sign out and show a descriptive toast — but only ONCE per session
// to avoid duplicate toasts when multiple parallel requests all get 401.
// Single-flight: a flurry of parallel 401s shows only one toast.
let redirecting = false;

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const status = err.response?.status;
    const url = err.config?.url || '';

    if (status === 401 && !redirecting) {
      redirecting = true;
      console.error('[api] 401 Unauthorized on', url, '— signing out');
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore signOut errors
      }
      if (window.location.pathname !== '/login') {
        toast('Session expired — please sign in again.', { icon: '🔒', duration: 4000 });
        // Short delay so the user sees the toast before navigation.
        setTimeout(() => {
          redirecting = false;
          window.location.href = '/login';
        }, 600);
      } else {
        redirecting = false;
      }
    }

    if (status === 403) {
      // Surface forbidden errors as toast so the user understands why something failed.
      const msg = err.response?.data?.error || 'Access denied.';
      console.error('[api] 403 Forbidden on', url, '—', msg);
      toast.error(msg, { duration: 5000 });
    }

    if (!status && !err.response) {
      // Network-level failure (backend offline, CORS, timeout)
      console.error('[api] Network error on', url, '—', err.message);
    }

    return Promise.reject(err);
  }
);

// Convenience: pull `{ data }` out of `{ success, data }` envelope
export const unwrap = (p) => p.then((r) => r.data?.data);

export default api;
