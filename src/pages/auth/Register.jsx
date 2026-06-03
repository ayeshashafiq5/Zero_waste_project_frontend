import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MapPin, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/common/Logo';
import { LAHORE } from '../../utils/constants';

export default function Register() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'ngo' ? 'ngo' : 'restaurant';
  const [form, setForm] = useState({
    role: initialRole,
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirm: '',
    lat: LAHORE.lat,
    lng: LAHORE.lng,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const detectLocation = () => {
    if (!('geolocation' in navigator)) return toast.error('Geolocation not supported');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((s) => ({ ...s, lat: pos.coords.latitude, lng: pos.coords.longitude }));
        setLocating(false);
        toast.success('Location captured');
      },
      (err) => {
        setLocating(false);
        toast.error(err.message || 'Could not get location');
      }
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) return setError('Name is required');
    if (form.name.trim().length < 2) return setError('Name must be at least 2 characters');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    if (form.password !== form.confirm) return setError('Passwords do not match');

    setLoading(true);
    try {
      const { session } = await signUp({
        email: form.email,
        password: form.password,
        name: form.name,
        role: form.role,
        address: form.address,
        phone: form.phone,
        lat: form.lat,
        lng: form.lng,
      });
      toast.success('Account created!');
      if (session) {
        navigate(form.role === 'ngo' ? '/ngo' : '/restaurant', { replace: true });
      } else {
        navigate('/login', { replace: true });
        toast('Check your email to confirm, then sign in.', { icon: '📩', duration: 5000 });
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 grid lg:grid-cols-2">

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
            Join the<br />network that<br />turns surplus<br />into meals.
          </h1>
          <p className="text-brand-100 mt-4 text-base max-w-sm leading-relaxed">
            Sign up in under 60 seconds. Restaurants post. NGOs collect. Real impact in real time.
          </p>

          {/* Feature list */}
          <div className="mt-8 space-y-3">
            {[
              { icon: '✓', text: 'Verified accounts, trusted matches' },
              { icon: '⚡', text: 'Real-time push alerts' },
              { icon: '📍', text: 'Proximity-based matching' },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-xl px-4 py-2.5 text-sm">
                <span className="text-lg">{f.icon}</span>
                <span className="text-white/90">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-brand-100/60">
          © {new Date().getFullYear()} Zero-Waste Food Connect
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="p-6 sm:p-10 overflow-y-auto">
        <div className="max-w-md mx-auto">

          {/* Mobile logo */}
          <div className="lg:hidden mb-4 text-center"><Logo stacked /></div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
            <Link to="/login" className="text-brand-700 font-semibold hover:underline">Sign in</Link>
          </div>

          {/* Role selection */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-5">
            {[
              { val: 'restaurant', emoji: '🍛', label: 'Restaurant', desc: 'I have surplus food' },
              { val: 'ngo', emoji: '🤝', label: 'NGO', desc: 'I distribute food' },
            ].map((r) => (
              <button
                type="button"
                key={r.val}
                onClick={() => setForm((s) => ({ ...s, role: r.val }))}
                className={`border-2 rounded-xl p-3 sm:p-4 text-left transition ${
                  form.role === r.val ? 'border-brand-600 bg-brand-50 ring-2 ring-brand-100' : 'border-gray-200 hover:border-brand-300'
                }`}
              >
                <div className="text-xl sm:text-2xl">{r.emoji}</div>
                <div className="font-bold text-gray-900 mt-1.5 sm:mt-2 text-sm">{r.label}</div>
                <div className="text-[11px] text-gray-500 leading-tight">{r.desc}</div>
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="name">{form.role === 'restaurant' ? 'Restaurant name' : 'NGO name'}</label>
              <input id="name" name="name" required minLength={2} maxLength={100} value={form.name} onChange={onChange} className="input" />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="email">Email</label>
                <input id="email" name="email" type="email" required value={form.email} onChange={onChange} className="input" />
              </div>
              <div>
                <label className="label" htmlFor="phone">Phone</label>
                <input id="phone" name="phone" value={form.phone} onChange={onChange} className="input" />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="address">Address</label>
              <div className="flex gap-2">
                <input id="address" name="address" value={form.address} onChange={onChange} className="input" placeholder="Street, area, city" />
                <button type="button" onClick={detectLocation} className="btn-secondary shrink-0">
                  <MapPin size={14} /> {locating ? '…' : 'Locate'}
                </button>
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                Lat {form.lat.toFixed?.(4) || form.lat}, Lng {form.lng.toFixed?.(4) || form.lng}
              </div>
            </div>

            {/* Password fields */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="password">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={form.password}
                    onChange={onChange}
                    className="input pr-10"
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
              <div>
                <label className="label" htmlFor="confirm">Confirm</label>
                <div className="relative">
                  <input
                    id="confirm"
                    name="confirm"
                    type={showConfirm ? 'text' : 'password'}
                    required
                    value={form.confirm}
                    onChange={onChange}
                    className="input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2">{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
            <p className="text-[11px] text-gray-500 text-center">
              By signing up you agree to our Terms and Privacy Policy.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
