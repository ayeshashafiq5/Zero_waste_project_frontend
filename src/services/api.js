import axios from 'axios';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

export const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/v1',
  timeout: 15_000,
});

// Attach the current Supabase JWT to every request
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, sign out and bounce to /login — but surface *why* with a toast
// (gap F11). Single-flight: a flurry of parallel 401s shouldn't show a
// dozen toasts.
let redirecting = false;
api.interceptors.response.use(
  (r) => r,
  async (err) => {
    if (err.response?.status === 401 && !redirecting) {
      redirecting = true;
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
      if (window.location.pathname !== '/login') {
        toast('Session expired — please sign in again.', { icon: '🔒', duration: 4000 });
        // Small delay so the user sees the toast before navigation.
        setTimeout(() => {
          window.location.href = '/login';
        }, 600);
      } else {
        redirecting = false;
      }
    }
    return Promise.reject(err);
  }
);

// Convenience: pull `{ data }` out of `{ success, data }` envelope
export const unwrap = (p) => p.then((r) => r.data?.data);

export default api;
