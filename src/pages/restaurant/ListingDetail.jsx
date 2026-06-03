import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { ChevronLeft, Phone, MapPin, Star, CheckCircle2 } from 'lucide-react';
import { AppShell } from '../../components/common/AppShell';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RatingModal } from '../../components/common/RatingModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { foodService } from '../../services/foodService';
import { ratingService } from '../../services/ratingService';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { expiryLabel, formatDateTime, relativeTime } from '../../utils/formatTime';

// Mockup #11 — Restaurant Live Update / Accepted detail
// Shows lifecycle timeline, the NGO who claimed it (when accepted/collected),
// real-time updates via Supabase channel, and a rating prompt after collection.
export default function ListingDetail() {
  const { id } = useParams();
  const { profile, role } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [ngo, setNgo] = useState(null);
  const [acceptedAt, setAcceptedAt] = useState(null);
  const [pickedUpAt, setPickedUpAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [alreadyRated, setAlreadyRated] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await foodService.getOne(id);
      setListing(data);
      if (data?.status === 'accepted' || data?.status === 'collected') {
        const { data: req } = await supabase
          .from('requests')
          .select('ngo_id, accepted_at, picked_up_at, ngo:users!requests_ngo_id_fkey(id, name, phone, address, avatar_url)')
          .eq('food_id', id)
          .order('accepted_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        setNgo(req?.ngo || null);
        setAcceptedAt(req?.accepted_at || null);
        setPickedUpAt(req?.picked_up_at || null);
      } else {
        setNgo(null);
        setAcceptedAt(null);
        setPickedUpAt(null);
      }
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    ratingService.getMine().then((mine) => setAlreadyRated((mine || []).some((r) => r.food_id === id))).catch(() => {});

    const channel = supabase
      .channel(`food_listing_${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'food_listings', filter: `id=eq.${id}` },
        (payload) => {
          setListing((prev) => ({ ...prev, ...payload.new }));
          if (payload.new.status === 'accepted' || payload.new.status === 'collected') load();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id, load]);

  const cancel = async () => {
    setCancelOpen(false);
    try {
      await foodService.cancel(id);
      toast.success('Listing cancelled');
      navigate('/restaurant/listings');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Could not cancel');
    }
  };

  if (loading) return <AppShell><LoadingSpinner label="Loading listing…" /></AppShell>;
  if (error || !listing)
    return (
      <AppShell>
        <Link to="/restaurant/listings" className="text-sm text-gray-500"><ChevronLeft size={14} className="inline" /> Back</Link>
        <div className="card p-8 text-center mt-4">
          <div className="text-4xl mb-2">😕</div>
          <div className="font-bold">{error || 'Listing not found'}</div>
        </div>
      </AppShell>
    );

  const accepted = listing.status === 'accepted' || listing.status === 'collected';
  const collected = listing.status === 'collected';
  const owns = listing.restaurant_id === profile?.id || listing.restaurant?.id === profile?.id;

  return (
    <AppShell>
      <Link to={role === 'restaurant' ? '/restaurant/listings' : '/ngo/accepted'} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ChevronLeft size={14} /> Back
      </Link>

      {/* Hero banner when newly accepted */}
      {accepted && ngo && !collected && (
        <div className="bg-gradient-to-r from-yellow-50 to-brand-50 border-2 border-yellow-300 rounded-2xl p-4 sm:p-5 flex flex-wrap sm:flex-nowrap items-start sm:items-center gap-3 sm:gap-4 mt-3 shadow-sm">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-400 text-yellow-900 flex items-center justify-center text-lg sm:text-xl shadow-md shrink-0">✓</div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold uppercase text-yellow-700 tracking-wide">Live update</div>
            <div className="text-base sm:text-lg font-extrabold text-gray-900 break-words">{ngo.name} accepted your listing 🎉</div>
            <div className="text-xs text-gray-600">Pickup expected before {formatDateTime(listing.expiry_time)}</div>
          </div>
          {ngo.phone && (
            <a href={`tel:${ngo.phone}`} className="btn-secondary text-xs whitespace-nowrap self-start sm:self-auto"><Phone size={14} /> Call</a>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_360px] gap-5 mt-5">
        {/* Timeline */}
        <div className="card overflow-hidden">
          {listing.image_url && (
            <div className="aspect-video bg-gray-100 max-h-72">
              <img src={listing.image_url} alt={listing.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500 font-mono">{listing.id.slice(0, 8)}…</div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 break-words">{listing.title}</div>
            </div>
            <StatusBadge status={listing.status} size="md" />
          </div>

          <div className="mt-6 space-y-5 relative">
            <div className="absolute left-[14px] top-3 bottom-3 w-0.5 bg-gray-200" />
            <TimelineStep done state="done" label="Posted" at={listing.created_at} sub="Push sent to nearby NGOs" />
            <TimelineStep
              done={accepted}
              active={accepted && !collected}
              label={accepted ? `Accepted by ${ngo?.name || 'NGO'}` : 'Awaiting acceptance'}
              at={accepted ? acceptedAt : null}
              sub={accepted ? 'Pickup pending' : 'NGOs within range were notified'}
            />
            <TimelineStep
              done={collected}
              label="Picked up"
              at={collected ? pickedUpAt : null}
              sub={collected ? 'Meals successfully rescued' : '—'}
            />
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <Cell label="Quantity" value={`${listing.quantity} meals`} />
            <Cell label="Food type" value={listing.food_type || '—'} />
            <Cell label="Expires" value={expiryLabel(listing.expiry_time)} />
            <Cell label="Posted" value={relativeTime(listing.created_at)} />
          </div>

          {listing.description && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="label">Description</div>
              <p className="text-sm text-gray-700 leading-relaxed">{listing.description}</p>
            </div>
          )}

          {listing.pickup_notes && (
            <div className="mt-4 bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-xs text-yellow-900">
              <div className="font-bold mb-0.5">Pickup notes</div>
              {listing.pickup_notes}
            </div>
          )}

          {owns && (listing.status === 'available' || listing.status === 'accepted') && (
            <div className="mt-5 pt-5 border-t border-gray-100 flex justify-end">
              <button onClick={() => setCancelOpen(true)} className="btn-secondary text-red-600 border-red-200">Cancel listing</button>
            </div>
          )}
          </div>{/* /p-6 body */}
        </div>

        {/* Sidebar: NGO / Rating */}
        <div className="space-y-4">
          {/* SIDEBAR — three distinct states, each tuned to what the user actually needs */}

          {/* State 1: AVAILABLE — nobody has claimed it yet */}
          {!accepted && (
            <div className="card p-5 text-center">
              <div className="text-3xl">📡</div>
              <div className="font-bold text-gray-900 mt-2">Waiting for an NGO</div>
              <p className="text-xs text-gray-500 mt-1">Nearby NGOs have been notified. You&apos;ll see them here the moment they accept.</p>
            </div>
          )}

          {/* State 2: ACCEPTED, pickup pending — coordination is the priority */}
          {accepted && !collected && ngo && (
            <div className="card p-5">
              <div className="text-xs font-bold uppercase text-gray-500">NGO who accepted</div>
              <div className="mt-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white text-xl font-bold flex items-center justify-center">
                  {(ngo.name || 'N').slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-gray-900 break-words">{ngo.name}</div>
                  {ngo.address && (
                    <div className="text-xs text-gray-500 break-words flex items-start gap-1">
                      <MapPin size={11} className="shrink-0 mt-0.5" /> {ngo.address}
                    </div>
                  )}
                </div>
              </div>
              {ngo.phone && (
                <a href={`tel:${ngo.phone}`} className="btn-primary w-full mt-4">
                  <Phone size={14} /> Call NGO
                </a>
              )}
            </div>
          )}

          {/* State 3: COLLECTED — celebratory, no contact noise.
              Contact info is tucked inside a <details> so it's discoverable but invisible by default. */}
          {collected && ngo && (
            <div className="card p-5 bg-gradient-to-br from-brand-50 to-emerald-50 border-brand-200">
              <div className="flex items-center gap-2 text-brand-700">
                <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center">
                  <CheckCircle2 size={16} />
                </div>
                <div className="text-sm font-extrabold">Pickup complete</div>
              </div>
              <p className="text-sm text-gray-700 mt-3 leading-snug">
                Delivered to <span className="font-bold">{ngo.name}</span>
                {ngo.address && <span className="text-gray-500"> · {ngo.address}</span>}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                <div className="bg-white/70 rounded-lg p-2">
                  <div className="text-lg font-extrabold text-brand-700">{listing.quantity}</div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-500">meals rescued</div>
                </div>
                <div className="bg-white/70 rounded-lg p-2">
                  <div className="text-lg font-extrabold text-brand-700">~{listing.quantity}</div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-500">people fed</div>
                </div>
              </div>
              {ngo.phone && (
                <details className="mt-4 text-xs">
                  <summary className="text-gray-500 hover:text-gray-700 cursor-pointer select-none">
                    Need to reach them about this pickup?
                  </summary>
                  <a
                    href={`tel:${ngo.phone}`}
                    className="mt-2 inline-flex items-center gap-1 text-brand-700 font-semibold"
                  >
                    <Phone size={11} /> {ngo.phone}
                  </a>
                </details>
              )}
            </div>
          )}

          {/* Rating prompt — Restaurant rates NGO after collection */}
          {collected && owns && ngo && (
            <div className={`card p-5 ${alreadyRated ? '' : 'ring-2 ring-brand-200'}`}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center"><Star size={16} /></div>
                <div className="flex-1">
                  <div className="font-bold text-sm">{alreadyRated ? 'Rating submitted' : 'How did it go?'}</div>
                  <div className="text-xs text-gray-500">
                    {alreadyRated ? 'Thanks for your feedback.' : `Tell us about your experience with ${ngo.name}.`}
                  </div>
                </div>
              </div>
              {!alreadyRated && (
                <button onClick={() => setRatingOpen(true)} className="btn-primary w-full mt-3">
                  <Star size={14} /> Rate {ngo.name}
                </button>
              )}
              {alreadyRated && (
                <div className="mt-3 text-xs text-brand-700 flex items-center gap-1"><CheckCircle2 size={12} /> You rated this pickup</div>
              )}
            </div>
          )}
        </div>
      </div>

      <RatingModal
        open={ratingOpen}
        onClose={() => setRatingOpen(false)}
        foodId={listing.id}
        ratee={ngo}
        onSubmitted={() => setAlreadyRated(true)}
      />

      <ConfirmModal
        open={cancelOpen}
        title="Cancel listing?"
        message={
          <>
            Cancel <strong>{listing.title}</strong>?
            {listing.status === 'accepted' && (
              <> The NGO that accepted will be notified.</>
            )}
          </>
        }
        confirmText="Yes, cancel it"
        isDestructive={true}
        onConfirm={cancel}
        onCancel={() => setCancelOpen(false)}
      />
    </AppShell>
  );
}

const Cell = ({ label, value }) => (
  <div><div className="text-xs text-gray-500">{label}</div><div className="font-bold text-gray-900 truncate">{value}</div></div>
);
Cell.propTypes = { label: PropTypes.string, value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) };

const TimelineStep = ({ done, active, label, sub, at }) => (
  <div className="flex items-start gap-3 sm:gap-4 relative">
    <div
      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs z-10 shrink-0 ${
        done ? 'bg-brand-600 text-white' : active ? 'bg-yellow-500 text-white ring-4 ring-yellow-100' : 'bg-gray-100 border border-gray-200 text-gray-400'
      }`}
    >
      {done ? '✓' : active ? '→' : '•'}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-0.5">
        <div className={`font-semibold text-sm ${done || active ? 'text-gray-900' : 'text-gray-400'}`}>{label}</div>
        <div className="text-xs text-gray-400 whitespace-nowrap">{at ? formatDateTime(at) : '—'}</div>
      </div>
      {sub && <div className="text-xs text-gray-500 break-words">{sub}</div>}
    </div>
  </div>
);
TimelineStep.propTypes = { done: PropTypes.bool, active: PropTypes.bool, label: PropTypes.string, sub: PropTypes.string, at: PropTypes.string };
