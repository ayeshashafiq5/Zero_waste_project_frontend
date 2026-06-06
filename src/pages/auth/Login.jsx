import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/common/Logo';
import { TestCredentials } from '../../components/common/TestCredentials';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signIn, user, role, profile, profileLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const routeError = location.state?.error;

  // Navigate to the dashboard once auth + profile are both ready.
  // `submitting` is our flag that a login attempt is in progress.
  useEffect(() => {
    if (!submitting || profileLoading) return;
    if (user && role) {
      const from = location.state?.from?.pathname;
      const dest = from || (role === 'ngo' ? '/ngo' : role === 'admin' ? '/admin' : '/restaurant');
      setSubmitting(false);
      toast.success(`Welcome back, ${profile?.name || form.email}!`);
      navigate(dest, { replace: true });
    } else if (user && !role) {
      // Auth succeeded but profile load failed completely.
      setSubmitting(false);
      setError('Your account profile could not be loaded. Please try signing in again.');
    }
  }, [submitting, profileLoading, user, role, profile, navigate, location.state, form.email]);

  // Hard safety net: after 12 seconds, stop waiting and show an error.
  useEffect(() => {
    if (!submitting) return;
    const id = setTimeout(() => {
      setSubmitting(false);
      setError('Sign-in is taking too long. Please check your connection and try again.');
    }, 12000);
    return () => clearTimeout(id);
  }, [submitting]);

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(form);
      // onAuthStateChange triggers loadProfile → sets role in context.
      // The useEffect above detects when role is ready and navigates.
    } catch (err) {
      setSubmitting(false);
      setError(err.message || 'Invalid email or password');
    }
  };

  const loading = submitting;

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white grid lg:grid-cols-2">

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex bg-gradient-to-br from-brand-600 to-brand-800 text-white p-12 flex-col justify-between relative overflow-hidden">

        {/* Decorative background circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-1/3 -left-16 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 right-10 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />

        {/* Logo — large version custom-built for the panel */}
        <Link to="/" className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-4xl shadow-lg backdrop-blur-sm">
            🍽️
          </div>
          <div className="leading-tight">
            <div className="text-2xl font-extrabold text-white tracking-tight">Zero-Waste</div>
            <div className="text-base font-semibold text-brand-100">Food Connect</div>
          </div>
        </Link>

        {/* Hero content */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-brand-100 mb-6">
            🌱 Real-time food rescue · Lahore
          </div>
          <h1 className="text-5xl font-extrabold leading-tight text-white">
            Welcome<br />back.
          </h1>
          <p className="text-brand-100 mt-4 text-base max-w-sm leading-relaxed">
            Sign in to keep rescuing meals across the city. Every login means more food saved.
          </p>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { n: '12,840+', l: 'Meals Rescued' },
              { n: '95', l: 'Restaurants' },
              { n: '42', l: 'Partner NGOs' },
            ].map((s) => (
              <div key={s.l} className="bg-white/10 border border-white/15 rounded-xl p-3 text-center">
                <div className="text-xl font-extrabold text-white">{s.n}</div>
                <div className="text-[11px] text-brand-100 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-brand-100/60">
          © {new Date().getFullYear()} Zero-Waste Food Connect
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden mb-6 text-center">
            <Link to="/"><Logo stacked /></Link>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Sign in to your account</h2>
          <p className="text-sm text-gray-500 mt-1">
            New here?{' '}
            <Link to="/register" className="text-brand-700 font-semibold hover:underline">
              Create an account
            </Link>
          </p>

          {routeError === 'profile_missing' && (
            <div className="mt-4 text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3">
              <span className="font-semibold">Account profile not found.</span>{' '}
              Your login succeeded but your profile could not be loaded — this can happen on a new device or after an account change. Please sign in again. If the issue persists, contact support.
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={onChange}
                className="input"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={onChange}
                  className="input pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <TestCredentials onFill={(creds) => setForm(creds)} />

          <p className="text-center text-xs text-gray-500 mt-6">
            By signing in you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
