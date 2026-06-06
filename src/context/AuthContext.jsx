import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

// Build a minimal profile from the JWT's user_metadata — zero DB round-trips.
// Returns null if user_metadata doesn't contain a recognised role, in which case
// the DB fetch is required (non-silent loadProfile).
function buildImmediateProfile(user) {
  const meta = user.user_metadata || {};
  const rawRole = (meta.role || '').toLowerCase().trim();
  const role = ['restaurant', 'ngo', 'admin'].includes(rawRole) ? rawRole : null;
  if (!role) return null;
  return {
    id: user.id,
    email: user.email,
    role,
    name: meta.name || user.email?.split('@')[0] || 'User',
    address: meta.address || null,
    lat: meta.lat ? parseFloat(meta.lat) : null,
    lng: meta.lng ? parseFloat(meta.lng) : null,
    phone: meta.phone || null,
    avatar_url: null,
    about: null,
    verified: role === 'restaurant' || role === 'admin',
    service_radius_km: null,
    created_at: null,
    updated_at: null,
  };
}

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  // profileLoading is ONLY set true when we NEED the DB result before rendering
  // (i.e. user_metadata has no role). Background silent enrichment never touches it.
  const [profileLoading, setProfileLoading] = useState(false);

  // ---------------------------------------------------------------------------
  // tryCreateProfile — upsert a public.users row from auth metadata.
  // Called only when the SELECT finds no row. Uses a 4-second abort to prevent
  // an unresponsive DB from blocking the auth flow.
  // ---------------------------------------------------------------------------
  const tryCreateProfile = useCallback(async (userId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id !== userId) return null;

      const meta = user.user_metadata || {};
      const rawRole = (meta.role || '').toLowerCase().trim();
      const role = rawRole === 'ngo' || rawRole === 'admin' ? rawRole : 'restaurant';

      const row = {
        id: userId,
        email: user.email,
        name: meta.name || user.email.split('@')[0],
        role,
        address: meta.address || null,
        lat: meta.lat ? parseFloat(meta.lat) : null,
        lng: meta.lng ? parseFloat(meta.lng) : null,
        phone: meta.phone || null,
        verified: role === 'restaurant' || role === 'admin',
      };

      const controller = new AbortController();
      const timerId = setTimeout(() => controller.abort(), 4000);
      let data, error;
      try {
        const res = await supabase
          .from('users')
          .upsert([row], { onConflict: 'id' })
          .select('*')
          .abortSignal(controller.signal)
          .single();
        data = res.data;
        error = res.error;
      } finally {
        clearTimeout(timerId);
      }

      if (error) {
        console.warn('[auth] auto-create profile failed:', error.message, error.code);
        return null;
      }
      console.info('[auth] auto-created public.users profile for', userId, '(role:', role + ')');
      return data;
    } catch (e) {
      console.warn('[auth] tryCreateProfile threw:', e.message);
      return null;
    }
  }, []);

  // ---------------------------------------------------------------------------
  // loadProfile — fetch the full public.users row from the database.
  //
  // Options:
  //   timeoutMs  — abort each query attempt after this many ms (default 3000)
  //   retries    — extra attempts after the first (default 0 = 1 attempt total)
  //   silent     — when true, skip profileLoading state updates and don't clear
  //                the profile on failure (used for Phase-2 background enrichment
  //                when Phase 1 already provided a usable role via user_metadata)
  //
  // Worst-case duration (silent=false): timeoutMs + tryCreateProfile(4s) = ~7s
  // — well under the Login.jsx 12-second safety net.
  // ---------------------------------------------------------------------------
  const loadProfile = useCallback(async (userId, { retries = 0, timeoutMs = 3000, silent = false } = {}) => {
    if (!silent) setProfileLoading(true);
    try {
      for (let attempt = 0; attempt <= retries; attempt++) {
        let data = null;
        let error = null;

        try {
          const controller = new AbortController();
          const timerId = setTimeout(() => controller.abort(), timeoutMs);
          const res = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .abortSignal(controller.signal)
            .maybeSingle();
          clearTimeout(timerId);
          data = res.data;
          error = res.error;
        } catch (fetchErr) {
          error = fetchErr;
        }

        if (error) {
          console.warn(`[auth] profile fetch failed (attempt ${attempt + 1}/${retries + 1}):`, error.message);
          if (attempt === retries) {
            if (!silent) {
              const created = await tryCreateProfile(userId);
              if (created) { setProfile(created); return created; }
              setProfile(null);
            }
            return null;
          }
        } else if (data) {
          setProfile(data);
          return data;
        } else {
          // Row not found
          console.warn(`[auth] no public.users row (attempt ${attempt + 1}/${retries + 1})`);
          if (attempt === retries) {
            // Try to auto-create whether silent or not — a missing row needs fixing.
            const created = await tryCreateProfile(userId);
            if (created) { setProfile(created); return created; }
            if (!silent) setProfile(null);
            return null;
          }
        }

        if (attempt < retries) await new Promise((r) => setTimeout(r, 300));
      }
      if (!silent) setProfile(null);
      return null;
    } finally {
      if (!silent) setProfileLoading(false);
    }
  }, [tryCreateProfile]);

  useEffect(() => {
    let mounted = true;

    // Safety net: force loading=false after 5 s if Supabase never responds.
    const timeoutId = setTimeout(() => {
      console.warn('[auth] getSession timed out after 5s — forcing loading=false');
      setLoading(false);
    }, 5000);

    // ── getSession (existing session on page load) ────────────────────────────
    supabase.auth.getSession().then(async ({ data: { session: sess }, error }) => {
      clearTimeout(timeoutId);
      if (!error && mounted) setSession(sess);
      setLoading(false); // release auth gate BEFORE any DB fetch

      if (!error && sess?.user) {
        // Phase 1 — instant role from JWT metadata (no DB).
        const immediate = buildImmediateProfile(sess.user);
        if (immediate && mounted) setProfile(immediate);

        // Phase 2 — enrich from DB.
        // silent=true  → background enrichment, don't block ProtectedRoute
        // silent=false → must wait for DB (metadata had no role)
        await loadProfile(sess.user.id, { silent: !!immediate });
      }
    }).catch(err => {
      clearTimeout(timeoutId);
      console.error('[auth] unhandled getSession rejection:', err);
      setLoading(false);
    });

    // ── onAuthStateChange (SIGNED_IN, TOKEN_REFRESHED, SIGNED_OUT, …) ────────
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      if (mounted) setSession(sess);

      if (sess?.user) {
        // Phase 1 — instant role from JWT metadata.
        const immediate = buildImmediateProfile(sess.user);
        if (immediate && mounted) setProfile(immediate);

        // Phase 2 — DB enrichment.
        await loadProfile(sess.user.id, { silent: !!immediate });
      } else {
        if (mounted) setProfile(null);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  // Live profile updates (admin verifies NGO, profile edited in another tab, etc.)
  useEffect(() => {
    if (!session?.user?.id) return;
    const channel = supabase
      .channel(`users_self_${session.user.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${session.user.id}` },
        (payload) => {
          if (payload.new) setProfile((p) => ({ ...(p || {}), ...payload.new }));
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session?.user?.id]);

  const signUp = async ({ email, password, name, role, address, lat, lng, phone }) => {
    const meta = { name, role };
    if (address) meta.address = address;
    if (phone) meta.phone = phone;
    if (Number.isFinite(lat)) meta.lat = String(lat);
    if (Number.isFinite(lng)) meta.lng = String(lng);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: meta },
    });
    if (error) throw error;
    return data;
  };

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // onAuthStateChange handles Phase 1 + Phase 2 profile loading after sign-in.
    return data;
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[auth] signOut error (ignored):', err.message);
    } finally {
      setProfile(null);
      setSession(null);
    }
  };

  const value = {
    user: session?.user ?? null,
    session,
    profile,
    role: profile?.role ?? null,
    loading,
    profileLoading,
    signUp,
    signIn,
    signOut,
    refreshProfile: () => (session?.user ? loadProfile(session.user.id) : Promise.resolve(null)),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = { children: PropTypes.node };

export const useAuth = () => useContext(AuthContext);
