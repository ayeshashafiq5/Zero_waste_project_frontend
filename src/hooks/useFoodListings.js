import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { foodService } from '../services/foodService';

// Restaurant-side: subscribe to my own listings' updates (accepted, collected, expired)
// NGO-side: live feed of available food (insert/update/delete on food_listings)
export const useFoodListings = ({ scope = 'available', restaurantId } = {}) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = scope === 'mine' ? await foodService.getMine() : await foodService.listAvailable();
      setListings(data || []);
      setError(null);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    load();

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
            // Status transitioned → joined fields (acceptedBy, restaurant) need REST refetch
            // since realtime payloads don't include FK joins.
            if (scope === 'mine' && row.status !== prevRow?.status) {
              load();
            }
          } else if (payload.eventType === 'DELETE') {
            setListings((prev) => prev.filter((l) => l.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load, scope, restaurantId]);

  return { listings, loading, error, refresh: load };
};
