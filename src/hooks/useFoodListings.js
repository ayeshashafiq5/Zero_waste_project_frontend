import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { foodService } from '../services/foodService';
import { useAuth } from '../context/AuthContext';

// Timeout for each API call: if the backend doesn't respond within this
// window, treat it as a failure so `loading` is always cleared.
const API_TIMEOUT_MS = 10_000;

/**
 * Wraps a promise with a timeout. Rejects with a descriptive error when the
 * backend doesn't respond in time, ensuring `loading` is always cleared.
 */
function withTimeout(promise, ms = API_TIMEOUT_MS) {
  const timeout = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error(`Request timed out after ${ms / 1000}s — check your backend connection.`)),
      ms
    )
  );
  return Promise.race([promise, timeout]);
}

// Restaurant-side: subscribe to my own listings' updates (accepted, collected, expired)
// NGO-side: live feed of available food (insert/update/delete on food_listings)
export const useFoodListings = ({ scope = 'available', restaurantId } = {}) => {
  const { loading: authLoading, user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    // ROOT CAUSE FIX (dashboard infinite loading):
    //
    // The previous implementation fetched listings immediately on mount,
    // regardless of auth state. If the auth context was still resolving
    // (authLoading=true), the request went out without a Bearer token →
    // backend returned 401 → api.js interceptor called signOut() + redirect
    // to /login → ProtectedRoute still saw loading=true → infinite spinner.
    //
    // Fix: do NOT start the API call until auth has finished loading AND
    // a user session is confirmed. This prevents unauthorised requests
    // and breaks the 401 → signOut → spinner → 401 loop.
    if (authLoading) return;
    if (!user) {
      // No session — don't attempt the fetch. ProtectedRoute will redirect.
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fetchFn = scope === 'mine' ? foodService.getMine() : foodService.listAvailable();
      const data = await withTimeout(fetchFn);
      setListings(data || []);
    } catch (e) {
      const message = e.response?.data?.error || e.message || 'Failed to load listings';
      console.error('[useFoodListings] load error:', message, '(scope:', scope + ')');
      setError(message);
      // Keep any existing listings in place — don't wipe the UI on a transient error.
    } finally {
      setLoading(false);
    }
  }, [scope, authLoading, user]);

  useEffect(() => {
    load();

    // Only subscribe to realtime once auth has resolved and we have a user.
    // If auth is still loading, we'll re-run this effect when authLoading changes.
    if (authLoading || !user) return;

    const channel = supabase
      .channel(`food_listings_${scope}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'food_listings' },
        (payload) => {
          if (scope === 'mine' && restaurantId) {
            const row = payload.new || payload.old;
            if (row?.restaurant_id !== restaurantId) return;
          }

          if (payload.eventType === 'INSERT') {
            const row = payload.new;
            // Available-scope filter
            if (scope === 'available' && row.status !== 'available') return;
            setListings((prev) => [row, ...prev.filter((l) => l.id !== row.id)]);
          } else if (payload.eventType === 'UPDATE') {
            const row = payload.new;
            const prevRow = payload.old;
            setListings((prev) => {
              const exists = prev.some((l) => l.id === row.id);
              if (scope === 'available' && row.status !== 'available') {
                return prev.filter((l) => l.id !== row.id);
              }
              return exists
                ? prev.map((l) => (l.id === row.id ? { ...l, ...row } : l))
                : [row, ...prev];
            });
            // Status transitioned — joined fields (acceptedBy, restaurant) need REST refetch
            // since realtime payloads don't include FK joins.
            if (scope === 'mine' && row.status !== prevRow?.status) {
              load();
            }
          } else if (payload.eventType === 'DELETE') {
            setListings((prev) => prev.filter((l) => l.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[useFoodListings] realtime subscribed (scope:', scope + ')');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('[useFoodListings] realtime channel issue:', status, '(scope:', scope + ')');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load, scope, restaurantId, authLoading, user]);

  return { listings, loading, error, refresh: load };
};
