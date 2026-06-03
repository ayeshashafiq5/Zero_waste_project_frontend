import { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, MapPin, Phone, Clock, Star, Navigation } from 'lucide-react';
import { AppShell } from '../../components/common/AppShell';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RatingModal } from '../../components/common/RatingModal';
import { ngoService } from '../../services/ngoService';
import { foodService } from '../../services/foodService';
import { ratingService } from '../../services/ratingService';
import { expiryLabel, formatDateTime } from '../../utils/formatTime';
import { Pagination, PAGE_SIZE } from '../../components/common/Pagination';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { useLocation } from '../../hooks/useLocation';
import { haversineDistance, formatDistance } from '../../utils/distance';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'picked_up', label: 'Collected' },
];

export default function Accepted() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [tab, setTab] = useState('all');
  const [ratedFoodIds, setRatedFoodIds] = useState(new Set());
  const [pickupTarget, setPickupTarget] = useState(null);
  const [ratingTarget, setRatingTarget] = useState(null); // { foodId, ratee }
  const [releaseTarget, setReleaseTarget] = useState(null);
  const [page, setPage] = useState(1);
  const { location, ready } = useLocation();

  const load = async () => {
    setLoading(true);
    try {
      const [reqs, mine] = await Promise.all([
        ngoService.getRequests(),
        ratingService.getMine().catch(() => []),
      ]);
      setRequests(reqs || []);
      setRatedFoodIds(new Set((mine || []).map((r) => r.food_id)));
    } catch (e) {
      toast.error(e.response?.data?.error || 'Could not load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const confirmPickup = async () => {
    if (!pickupTarget) return;
    const r = pickupTarget;
    setPickupTarget(null);
    setBusyId(r.food.id);
    try {
      await foodService.collect(r.food.id);
      toast.success('Marked as collected. Thank you!');
      await load();
      if (!ratedFoodIds.has(r.food.id) && r.food.restaurant) {
        setRatingTarget({ foodId: r.food.id, ratee: { id: r.food.restaurant.id, name: r.food.restaurant.name } });
      }
    } catch (e) {
      toast.error(e.response?.data?.error || 'Could not mark collected');
    } finally {
      setBusyId(null);
    }
  };

  const release = async () => {
    if (!releaseTarget) return;
    const id = releaseTarget.food.id;
    setReleaseTarget(null);
    setBusyId(id);
    try {
      await foodService.release(id);
      toast.success('Released — another NGO can now claim this listing.');
      await load();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Could not release');
    } finally {
      setBusyId(null);
    }
  };

  const filtered = useMemo(
    () =>
      (tab === 'all' ? requests : requests.filter((r) => r.status === tab))
        .filter((r) => r.food), // skip orphaned rows where listing was hard-deleted
    [requests, tab]
  );

  // Reset page when tab changes.
  useEffect(() => { setPage(1); }, [tab]);

  return (
    <AppShell>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Accepted & Pickups</h1>
      <p className="text-sm text-gray-500 mt-1">Track your in-progress and completed pickups.</p>

      <div className="card p-1 mt-5 flex w-full sm:w-auto overflow-x-auto scrollbar-thin">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-xs font-semibold px-4 py-2 rounded-md whitespace-nowrap shrink-0 flex-1 sm:flex-none ${tab === t.key ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="card mt-5">
          <EmptyState
            icon="📦"
            title="No pickups yet"
            description="Once you accept a food listing, it'll show up here so you can track and confirm pickup."
          />
        </div>
      ) : (
        <>
        <div className="grid lg:grid-cols-2 gap-4 mt-5">
          {filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((r) => {
            const f = r.food;
            const rated = ratedFoodIds.has(f.id);
            const distanceKm = ready && Number.isFinite(f.lat) && Number.isFinite(f.lng)
              ? haversineDistance(location.lat, location.lng, f.lat, f.lng)
              : null;
            const dirUrl = Number.isFinite(f.lat) && Number.isFinite(f.lng)
              ? `https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}`
              : null;
            return (
              <div key={r.id} className="card p-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs text-gray-500">Accepted {formatDateTime(r.accepted_at)}</div>
                    <div className="font-bold text-gray-900 text-lg break-words">{f.title}</div>
                  </div>
                  <StatusBadge status={r.status === 'picked_up' ? 'collected' : 'accepted'} />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                  <div>
                    <div className="text-xs text-gray-500">Quantity</div>
                    <div className="font-bold text-gray-900">{f.quantity} meals</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">{r.status === 'picked_up' ? 'Picked up' : 'Expires'}</div>
                    <div className="font-bold text-gray-900 flex items-center gap-1">
                      <Clock size={14} className="text-orange-500" />
                      {r.status === 'picked_up' ? formatDateTime(r.picked_up_at) : expiryLabel(f.expiry_time)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-gray-500">Pickup from</div>
                    {distanceKm != null && (
                      <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                        {formatDistance(distanceKm)} away
                      </span>
                    )}
                  </div>
                  <div className="font-semibold text-gray-900 break-words">{f.restaurant?.name}</div>
                  <div className="text-xs text-gray-600 mt-0.5 flex items-start gap-1 break-words">
                    <MapPin size={12} className="shrink-0 mt-0.5" />
                    {f.restaurant?.address || `${f.lat?.toFixed(3)}, ${f.lng?.toFixed(3)}`}
                  </div>
                  {f.restaurant?.phone && (
                    <div className="text-xs text-gray-600 mt-0.5 flex items-center gap-1"><Phone size={12} /> {f.restaurant.phone}</div>
                  )}
                  {f.pickup_notes && (
                    <div className="text-xs bg-yellow-50 border border-yellow-100 rounded-lg p-2 mt-2 text-yellow-900">{f.pickup_notes}</div>
                  )}
                  {dirUrl && r.status === 'accepted' && (
                    <a
                      href={dirUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-xs mt-3 w-full"
                    >
                      <Navigation size={12} /> Get directions
                    </a>
                  )}
                </div>

                {r.status === 'accepted' && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setReleaseTarget(r)}
                      disabled={busyId === f.id}
                      className="btn-secondary text-xs flex-1"
                    >
                      Release
                    </button>
                    <button onClick={() => setPickupTarget(r)} disabled={busyId === f.id} className="btn-primary flex-1">
                      <CheckCircle2 size={16} /> {busyId === f.id ? 'Confirming…' : 'Confirm pickup'}
                    </button>
                  </div>
                )}

                {r.status === 'picked_up' && f.restaurant && (
                  rated ? (
                    <div className="mt-4 text-xs text-brand-700 flex items-center gap-1 justify-center">
                      <CheckCircle2 size={12} /> You rated this pickup
                    </div>
                  ) : (
                    <button
                      onClick={() => setRatingTarget({ foodId: f.id, ratee: { id: f.restaurant.id, name: f.restaurant.name } })}
                      className="btn-secondary w-full mt-4"
                    >
                      <Star size={14} /> Rate {f.restaurant.name}
                    </button>
                  )
                )}
              </div>
            );
          })}
        </div>
        <Pagination total={filtered.length} page={page} onPageChange={setPage} />
        </>
      )}

      <RatingModal
        open={!!ratingTarget}
        onClose={() => setRatingTarget(null)}
        foodId={ratingTarget?.foodId}
        ratee={ratingTarget?.ratee}
        onSubmitted={() => {
          if (ratingTarget) setRatedFoodIds((s) => new Set(s).add(ratingTarget.foodId));
        }}
      />

      <ConfirmModal
        open={!!pickupTarget}
        title="Confirm Pickup"
        message={
          <>
            Are you sure you have successfully picked up <strong>{pickupTarget?.food?.title}</strong> from <strong>{pickupTarget?.food?.restaurant?.name}</strong>?
          </>
        }
        confirmText="Yes, I picked it up"
        onConfirm={confirmPickup}
        onCancel={() => setPickupTarget(null)}
      />

      <ConfirmModal
        open={!!releaseTarget}
        title="Release this listing?"
        message={
          <>
            <strong>{releaseTarget?.food?.title}</strong> will be released so other NGOs nearby can claim it. Use this if you can no longer make the pickup.
          </>
        }
        confirmText="Yes, release it"
        isDestructive={true}
        onConfirm={release}
        onCancel={() => setReleaseTarget(null)}
      />
    </AppShell>
  );
}
