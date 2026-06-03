import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AppShell } from '../../components/common/AppShell';
import { ImageUpload } from '../../components/common/ImageUpload';
import { useAuth } from '../../context/AuthContext';
import { foodService } from '../../services/foodService';
import { toDateTimeLocalValue } from '../../utils/formatTime';
import { FOOD_TYPES } from '../../utils/constants';
import { inPakistan } from '../../utils/distance';

const schema = z.object({
  title: z.string().min(2, 'Please give your food a title').max(200),
  description: z.string().optional(),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  food_type: z.enum(['vegetarian', 'non-vegetarian', 'vegan']),
  expiry_time: z.string().refine((val) => new Date(val) > new Date(), {
    message: 'Expiry must be in the future',
  }),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  pickup_notes: z.string().optional(),
  image_url: z.string().optional(),
});

export default function PostFood() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const defaultExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000); // +2h
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      quantity: 10,
      food_type: 'non-vegetarian',
      expiry_time: toDateTimeLocalValue(defaultExpiry),
      lat: profile?.lat ?? 31.5204,
      lng: profile?.lng ?? 74.3587,
      pickup_notes: '',
      image_url: '',
    },
  });

  const [locating, setLocating] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const formValues = watch(); // To preview changes live

  const detect = () => {
    if (!('geolocation' in navigator)) return toast.error('Geolocation not supported');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        if (!inPakistan(latitude, longitude)) {
          toast.error('Location appears outside Pakistan — please double-check before posting.');
        }
        setValue('lat', latitude);
        setValue('lng', longitude);
        setLocating(false);
        toast.success(`Location captured (±${Math.round(accuracy)} m)`);
      },
      (err) => {
        setLocating(false);
        toast.error(err.message);
      },
      { enableHighAccuracy: true, timeout: 12_000 }
    );
  };

  const submit = async (data) => {
    setSubmitError(null);
    if (!inPakistan(data.lat, data.lng)) {
      return setSubmitError('Pickup coordinates are outside the supported region (Pakistan).');
    }

    try {
      const payload = {
        ...data,
        expiry_time: new Date(data.expiry_time).toISOString(),
        image_url: data.image_url || undefined,
      };
      const response = await foodService.create(payload);
      
      const n = response.notifiedNgoCount;
      if (n === 0) {
        toast(`Posted — but no NGOs match yet in your area.`, { icon: '⚠️', duration: 5000 });
      } else if (typeof n === 'number') {
        toast.success(`Posted! ${n} NGO${n === 1 ? '' : 's'} alerted nearby.`);
      } else {
        toast.success(`Posted! Nearby NGOs alerted: ${response.title}`);
      }
      navigate('/restaurant/listings');
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.message || err.response?.data?.error || err.message;
      setSubmitError(msg);
    }
  };

  return (
    <AppShell>
      <Link to="/restaurant" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"><ChevronLeft size={14} /> Dashboard</Link>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">Post Surplus Food</h1>
      <p className="text-sm text-gray-500 mt-1">Nearby NGOs within 10 km will be alerted in real time.</p>

      <div className="grid md:grid-cols-[1fr_340px] lg:grid-cols-[1fr_360px] gap-6 mt-6">
        <form onSubmit={handleSubmit(submit)} className="card p-6 space-y-4">
          <div>
            <label className="label" htmlFor="title">Title *</label>
            <input id="title" {...register('title')} maxLength={200} className="input" placeholder="e.g. Biryani & Karahi" />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="label" htmlFor="description">Description</label>
            <textarea id="description" {...register('description')} rows="3" className="input" placeholder="Brief description, allergens, packaging…" />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="quantity">Quantity (meals) *</label>
              <input id="quantity" type="number" min={1} max={10000} {...register('quantity')} className="input" />
              {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
            </div>
            <div>
              <label className="label" htmlFor="food_type">Food type</label>
              <select id="food_type" {...register('food_type')} className="input">
                {FOOD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {errors.food_type && <p className="text-red-500 text-xs mt-1">{errors.food_type.message}</p>}
            </div>
          </div>
          <div>
            <label className="label" htmlFor="expiry_time">Expires at *</label>
            <input id="expiry_time" type="datetime-local" {...register('expiry_time')} className="input" />
            {errors.expiry_time && <p className="text-red-500 text-xs mt-1">{errors.expiry_time.message}</p>}
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <label className="label text-gray-800">Pickup location</label>
            <p className="text-xs text-gray-500 mb-3">Set the exact coordinates where the food can be collected.</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Latitude</label>
                <input type="number" step="any" {...register('lat')} className="input bg-white" placeholder="e.g. 31.5204" />
                {errors.lat && <p className="text-red-500 text-xs mt-1">{errors.lat.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Longitude</label>
                <input type="number" step="any" {...register('lng')} className="input bg-white" placeholder="e.g. 74.3587" />
                {errors.lng && <p className="text-red-500 text-xs mt-1">{errors.lng.message}</p>}
              </div>
            </div>
            <button type="button" onClick={detect} className="btn-secondary mt-3 w-full justify-center bg-white shadow-sm border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors">
              <MapPin size={16} className="text-brand-600" /> 
              <span className="ml-1 text-gray-700 font-medium">{locating ? 'Locating your position…' : 'Detect my current location'}</span>
            </button>
          </div>
          <div>
            <label className="label" htmlFor="pickup_notes">Pickup notes</label>
            <input id="pickup_notes" {...register('pickup_notes')} className="input" placeholder="e.g. Side entrance, ask for the manager" />
            {errors.pickup_notes && <p className="text-red-500 text-xs mt-1">{errors.pickup_notes.message}</p>}
          </div>

          <div>
            <label className="label">
              Photo{' '}
              <span className="text-gray-400 font-normal text-[11px]">(optional — photos get accepted ~3× faster)</span>
            </label>
            <ImageUpload
              value={formValues.image_url}
              onChange={(url) => setValue('image_url', url || '')}
            />
          </div>

          {submitError && (
            <div className="text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2">{submitError}</div>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-2 border-t border-gray-100">
            <Link to="/restaurant" className="btn-secondary w-full sm:w-auto justify-center">Cancel</Link>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full sm:w-auto justify-center">{isSubmitting ? 'Posting…' : 'Post food'}</button>
          </div>
        </form>

        <div className="space-y-4">
          <div className="card p-5">
            <div className="text-xs font-bold text-gray-500 uppercase">Preview · what NGOs see</div>
            <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden mt-3">
              {formValues.image_url && (
                <div className="aspect-video bg-gray-100">
                  <img src={formValues.image_url} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 font-semibold">Available</span>
                  <span className="text-xs text-gray-500">preview</span>
                </div>
                <div className="font-bold text-gray-900 mt-2">{formValues.title || 'Your food title'}</div>
                <div className="text-xs text-gray-500">{profile?.name || 'Your restaurant'}</div>
                <div className="text-xs text-gray-700 mt-2 leading-snug">{formValues.description || '—'}</div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                  <div className="text-xs"><span className="font-semibold text-gray-900">{formValues.quantity || 0} meals</span></div>
                  <button className="btn-primary text-xs" disabled>Accept</button>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-xs text-orange-900">
            <div className="font-bold">⚡ Reach</div>
            Verified NGOs within ~10 km will be notified instantly.
          </div>
        </div>
      </div>
    </AppShell>
  );
}
