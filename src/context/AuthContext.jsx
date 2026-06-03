import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Brief retry handles the race between auth.users INSERT and the handle_new_user trigger
  // commit visible to the anon client (rare, but reproducible on cold-start Supabase projects).
  const loadProfile = useCallback(async (userId, { retries = 2 } = {}) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (error) {
        console.warn('[auth] profile fetch failed:', error.message);
        if (attempt === retries) {
          setProfile(null);
          return null;
        }
      } else if (data) {
        setProfile(data);
        return data;
      }
      // wait 400ms before retry
      if (attempt < retries) await new Promise((r) => setTimeout(r, 400));
    }
    setProfile(null);
    return null;
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      if (session?.user) await loadProfile(session.user.id);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      setSession(sess);
      if (sess?.user) await loadProfile(sess.user.id);
      else setProfile(null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  // Watch the current user's row for live profile updates (admin verifies
  // NGO, profile updated in another tab, etc.) — gap F13.
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
    // Send numeric strings only when we have real values, otherwise omit the
    // key so the SQL trigger's NULLIF(...,'')::DOUBLE PRECISION cast doesn't
    // explode with 22P02 on empty strings (gap F9).
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

    // Fallback: if email confirmation is disabled, the user is signed in immediately,
    // and the DB trigger has populated public.users. Just refresh local profile.
    if (data.session?.user) await loadProfile(data.session.user.id);
    return data;
  };

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const p = await loadProfile(data.user.id);
    return { ...data, profile: p };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  };

  const value = {
    user: session?.user ?? null,
    session,
    profile,
    role: profile?.role ?? null,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile: () => (session?.user ? loadProfile(session.user.id) : Promise.resolve(null)),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = { children: PropTypes.node };

export const useAuth = () => useContext(AuthContext);
