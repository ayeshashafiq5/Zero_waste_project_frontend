import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MapPin, ShieldCheck } from 'lucide-react';
import { AppShell } from '../../components/common/AppShell';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { inPakistan } from '../../utils/distance';
import { DEFAULT_RADIUS_KM } from '../../utils/constants';

export default function NGOProfile() {
  const { profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    name: '', phone: '', address: '', about: '', lat: '', lng: '',
    service_radius_km: DEFAULT_RADIUS_KM,
  });
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        about: profile.about || '',
        lat: profile.lat ?? '',
        lng: profile.lng ?? '',
        service_radius_km: profile.service_radius_km ?? DEFAULT_RADIUS_KM,
      });
    }
  }, [profile]);

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const detect = () => {
    if (!('geolocation' in navigator)) return toast.error('Geolocation not supported');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (!inPakistan(latitude, longitude)) {
          toast.error('Location appears outside Pakistan — please double-check.');
        }
        setForm((s) => ({ ...s, lat: latitude, lng: longitude }));
        setLocating(false);
        toast.success(`Location captured (±${Math.round(pos.coords.accuracy)} m)`);
      },
      (err) => {
        setLocating(false);
        toast.error(err.message);
      },
      { enableHighAccuracy: true, timeout: 12_000 }
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    const lat = form.lat === '' ? null : Number(form.lat);
    const lng = form.lng === '' ? null : Number(form.lng);
    if (lat != null && lng != null && !inPakistan(lat, lng)) {
      return toast.error('Coordinates are outside the supported region (Pakistan).');
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        lat,
        lng,
        service_radius_km: Number(form.service_radius_km) || null,
      };
      await authService.updateProfile(payload);
      await refreshProfile();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">NGO Profile</h1>
            {profile?.verified && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-bold">
                <ShieldCheck size={13} /> Verified
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">Help restaurants verify your work and match you to nearby food.</p>
        </div>
      </div>

      <div className="card p-6 mt-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white text-2xl font-bold flex items-center justify-center">
          {(profile?.name || 'N').slice(0, 1).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 break-words">{profile?.name}</div>
          <div className="text-xs text-gray-500 break-words">{profile?.email}</div>
        </div>
      </div>

      <form onSubmit={submit} className="card p-6 mt-4 space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="name">NGO name</label>
            <input id="name" name="name" value={form.name} onChange={onChange} className="input" required />
          </div>
          <div>
            <label className="label" htmlFor="phone">Phone</label>
            <input id="phone" name="phone" value={form.phone} onChange={onChange} className="input" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="address">Base address</label>
          <input id="address" name="address" value={form.address} onChange={onChange} className="input" />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="lat">Latitude</label>
            <input id="lat" name="lat" type="number" step="any" value={form.lat} onChange={onChange} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="lng">Longitude</label>
            <input id="lng" name="lng" type="number" step="any" value={form.lng} onChange={onChange} className="input" />
          </div>
        </div>
        <button type="button" onClick={detect} disabled={locating} className="btn-secondary text-xs">
          <MapPin size={14} /> {locating ? 'Locating…' : 'Use current location'}
        </button>

        {/* Service radius — drives which food posts ping this NGO (gap L11) */}
        <div>
          <label className="label" htmlFor="service_radius_km">
            Service radius (km)
            <span className="text-gray-400 font-normal"> · we&apos;ll match listings within this distance</span>
          </label>
          <input
            id="service_radius_km"
            name="service_radius_km"
            type="number"
            min={1}
            max={100}
            step={1}
            value={form.service_radius_km}
            onChange={onChange}
            className="input w-32"
          />
        </div>

        <div>
          <label className="label" htmlFor="about">About your work</label>
          <textarea id="about" name="about" rows="3" value={form.about} onChange={onChange} className="input" />
        </div>
        <div className="flex items-center justify-end pt-3 border-t border-gray-100">
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save changes'}</button>
        </div>
      </form>
    </AppShell>
  );
}
