import { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

const ROLE_HOME = { restaurant: '/restaurant', ngo: '/ngo', admin: '/admin' };

// Maximum milliseconds to wait for the auth+profile loading gate before
// giving up and showing an error. This prevents the infinite-spinner scenario
// where loading never resolves (e.g. Supabase unreachable, profile row missing).
const MAX_WAIT_MS = 10000;

export const ProtectedRoute = ({ allowedRole }) => {
  const { user, role, loading, profileLoading } = useAuth();
  const location = useLocation();
  const [timedOut, setTimedOut] = useState(false);

  // Hard timeout on the loading gate.
  // Covers BOTH the auth session check (loading) AND the subsequent profile
  // fetch (profileLoading). The 5-second AuthContext timeout can fire
  // setLoading(false) while loadProfile is still in-flight; without this
  // guard, ProtectedRoute would see loading=false + role=null and redirect
  // to /login even though the profile is about to arrive.
  const isLoading = loading || profileLoading;

  useEffect(() => {
    if (!isLoading) return; // already resolved — no timer needed
    const id = setTimeout(() => setTimedOut(true), MAX_WAIT_MS);
    return () => clearTimeout(id);
  }, [isLoading]);

  // Reset the timed-out flag whenever loading genuinely resolves.
  useEffect(() => {
    if (!isLoading) setTimedOut(false);
  }, [isLoading]);

  // --- Auth gate ---
  if (isLoading) {
    if (timedOut) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-sm w-full bg-white border border-red-200 rounded-2xl shadow-lg p-8 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Session check timed out</h2>
            <p className="text-sm text-gray-500 mb-5">
              We couldn&apos;t verify your session in time. This is usually caused by a slow network
              or a temporary issue with the authentication service.
            </p>
            <a
              href="/login"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 transition-colors"
            >
              Return to Login
            </a>
          </div>
        </div>
      );
    }
    return <LoadingSpinner fullScreen label="Checking session…" />;
  }

  // --- User guard ---
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ROOT CAUSE FIX C (continued):
  // Original code: `allowedRole && role && role !== allowedRole`
  // Bug: when `role` is null (profile fetch failed / still pending), the condition
  // evaluates to false and falls through to <Outlet />, mounting the dashboard
  // without a valid role. The dashboard then makes API calls; the backend returns
  // 403/401; the api.js interceptor signs the user out and redirects to /login.
  // On reload the cycle repeats — an infinite redirect loop manifesting as a
  // permanent spinner.
  //
  // Fix: if the user is authenticated but we still have no role after loading
  // is complete, treat it as a profile-load failure and redirect with guidance.
  if (!role) {
    console.error('[auth] User authenticated but no role/profile found — profile load failed.');
    return <Navigate to="/login" state={{ from: location, error: 'profile_missing' }} replace />;
  }

  // Role mismatch — send to the correct dashboard.
  if (allowedRole && role !== allowedRole) {
    return <Navigate to={ROLE_HOME[role] ?? '/'} replace />;
  }

  // All good — render the protected page.
  return <Outlet />;
};

ProtectedRoute.propTypes = {
  allowedRole: PropTypes.oneOf(['restaurant', 'ngo', 'admin']),
};

// Keep profile in the prop-types signature for future consumers even though
// we access it from context above (avoids lint warning).
ProtectedRoute.defaultProps = {};
