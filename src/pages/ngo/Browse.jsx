import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '../../components/common/AppShell';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { FoodCard } from '../../components/ngo/FoodCard';
import { Pagination, PAGE_SIZE } from '../../components/common/Pagination';
import { useFoodListings } from '../../hooks/useFoodListings';
import { useLocation } from '../../hooks/useLocation';
import { useAuth } from '../../context/AuthContext';
import { haversineDistance } from '../../utils/distance';
import { DEFAULT_RADIUS_KM } from '../../utils/constants';

const TYPES = [
  { val: 'all', label: 'All types' },
  { val: 'vegetarian', label: 'Veg' },
  { val: 'non-vegetarian', label: 'Non-veg' },
  { val: 'vegan', label: 'Vegan' },
];

const FILTER_KEY = 'zwfc.browse.filters';
const loadStored = () => {
  try {
    return JSON.parse(localStorage.getItem(FILTER_KEY) || '{}');
  } catch {
    return {};
  }
};

export default function Browse() {
  const { profile } = useAuth();
  const { listings, loading } = useFoodListings({ scope: 'available' });
  const { location, ready } = useLocation();

  const stored = loadStored();
  const [type, setType] = useState(stored.type || 'all');
  const [radius, setRadius] = useState(
    stored.radius ?? profile?.service_radius_km ?? DEFAULT_RADIUS_KM
  );
  const [minQty, setMinQty] = useState(stored.minQty || 1);
  const [sort, setSort] = useState(stored.sort || 'distance');
  const [page, setPage] = useState(1);

  // Persist filters across visits.
  useEffect(() => {
    try {
      localStorage.setItem(FILTER_KEY, JSON.stringify({ type, radius, minQty, sort }));
    } catch {
      // localStorage disabled — fine, filters just won't persist
    }
  }, [type, radius, minQty, sort]);

  // Reset to page 1 whenever any filter changes.
  useEffect(() => { setPage(1); }, [type, radius, minQty, sort]);

  const filtered = useMemo(() => {
    let xs = listings.map((l) => ({
      ...l,
      distance: ready ? haversineDistance(location.lat, location.lng, l.lat, l.lng) : null,
    }));
    if (ready) xs = xs.filter((x) => x.distance <= radius);
    if (type !== 'all') xs = xs.filter((x) => x.food_type === type);
    if (minQty > 0) xs = xs.filter((x) => (x.quantity || 0) >= minQty);
    xs.sort((a, b) => {
      if (sort === 'distance' && ready) return a.distance - b.distance;
      return new Date(b.created_at) - new Date(a.created_at);
    });
    return xs;
  }, [listings, location, type, radius, minQty, sort, ready]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Available Food Near You</h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
            <span>
              {ready
                ? `Sorted by distance · ${filtered.length} of ${listings.length} listings`
                : `Awaiting location · ${listings.length} listings available`}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-brand-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              Live
            </span>
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-3 mt-4 sm:mt-5 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2">
        <div className="relative w-full sm:flex-1 sm:min-w-[180px]">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 overflow-x-auto scrollbar-thin">
            {TYPES.map((t) => (
              <button
                key={t.val}
                onClick={() => setType(t.val)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 ${type === t.val ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-gray-700 whitespace-nowrap">Within</span>
            <select value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="input py-1.5 w-auto">
              {[5, 10, 15, 25, 50].map((r) => <option key={r} value={r}>{r} km</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-gray-700 whitespace-nowrap">Min meals</span>
            <input
              type="number"
              min={1}
              value={minQty}
              onChange={(e) => setMinQty(Number(e.target.value) || 1)}
              className="input py-1.5 w-20"
            />
          </label>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="input py-2 w-auto">
            <option value="distance">Closest</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <div className="card mt-4">
          <EmptyState icon="🍽️" title="No matching food right now" description="Try widening the radius or clearing filters." />
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {paged.map((l) => <FoodCard key={l.id} listing={l} />)}
          </div>
          <Pagination
            total={filtered.length}
            page={page}
            onPageChange={setPage}
          />
        </>
      )}
    </AppShell>
  );
}
