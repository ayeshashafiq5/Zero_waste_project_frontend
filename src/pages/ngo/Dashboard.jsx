import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Search, Package, CheckCircle2, MapPin, TrendingUp, RefreshCw, WifiOff } from 'lucide-react';
import { AppShell } from '../../components/common/AppShell';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { FoodCard } from '../../components/ngo/FoodCard';
import { MapPanel } from '../../components/ngo/MapPanel';
import { PushSubscribePanel } from '../../components/ngo/PushSubscribePanel';
import { useFoodListings } from '../../hooks/useFoodListings';
import { useLocation } from '../../hooks/useLocation';
import { ngoService } from '../../services/ngoService';
import { haversineDistance } from '../../utils/distance';
import { DEFAULT_RADIUS_KM } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';

const COLOR_CLASSES = {
  brand:  { bg: 'bg-green-50',  icon: 'bg-green-100 text-green-700',  value: 'text-green-700' },
  yellow: { bg: 'bg-amber-50',  icon: 'bg-amber-100 text-amber-700',  value: 'text-amber-700' },
  blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-100 text-blue-700',    value: 'text-blue-700'  },
  orange: { bg: 'bg-orange-50', icon: 'bg-orange-100 text-orange-700', value: 'text-orange-700' },
};

const KPI = ({ icon, label, value, hint, color = 'brand' }) => {
  const cls = COLOR_CLASSES[color] || COLOR_CLASSES.brand;
  return (
    <div className={`card p-4 ${cls.bg}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${cls.icon}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-xs text-gray-500 font-medium truncate">{label}</div>
          <div className={`text-2xl font-extrabold ${cls.value}`}>{value}</div>
        </div>
      </div>
      {hint && <div className="text-xs text-gray-500 mt-2 pl-1">{hint}</div>}
    </div>
  );
};
KPI.propTypes = { icon: PropTypes.node, label: PropTypes.string, value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), hint: PropTypes.string, color: PropTypes.string };

export default function NGODashboard() {
  const { profile } = useAuth();
  const { listings, loading, refresh } = useFoodListings({ scope: 'available' });
  const { location, ready, status: locStatus, accuracy, request: requestLocation } = useLocation({ watch: true });
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState(null);
  const [listError, setListError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // NGO-set service radius wins over the platform default (gap L11).
  const radiusKm = profile?.service_radius_km || DEFAULT_RADIUS_KM;

  useEffect(() => {
    // Wait for auth to resolve before fetching stats—prevents sending
    // requests without a Bearer token on slow networks/initial loads.
    if (!profile?.id) return;
    ngoService.getStats()
      .then(setStats)
      .catch((e) => {
        const msg = e.response?.data?.error || e.message || 'Could not load stats';
        console.error('[NGODashboard] stats error:', msg);
        setStatsError(msg);
        setStats(null);
      });
  }, [profile?.id]);

  // Only compute distances once we have a real fix — otherwise we'd label
  // listings as "0.2 km away" against the Lahore fallback (gap L3).
  const nearbyAll = ready
    ? listings
        .map((l) => ({ ...l, distance: haversineDistance(location.lat, location.lng, l.lat, l.lng) }))
        .filter((l) => l.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance)
    : listings.slice(0, 0);

  const nearby = nearbyAll.slice(0, 6);

  const handleRefresh = async () => {
    setRefreshing(true);
    setListError(null);
    setStatsError(null);
    await refresh();
    // Re-fetch stats too on manual refresh
    ngoService.getStats().then(setStats).catch((e) => setStatsError(e.message));
    setRefreshing(false);
  };

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {profile?.name ? `Welcome, ${profile.name.split(' ')[0]} 👋` : 'NGO Dashboard'}
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex flex-wrap items-center gap-x-2">
            <span>Live food drops nearby · sorted by distance ·</span>
            {locStatus === 'granted' ? (
              <span className="text-green-600 font-medium">
                📍 Location active{accuracy ? ` · ±${Math.round(accuracy)} m` : ''}
              </span>
            ) : locStatus === 'denied' ? (
              <button onClick={requestLocation} className="text-amber-600 font-medium underline">⚠ Enable location</button>
            ) : (
              <span className="text-gray-400">Detecting location…</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary text-xs"
            title="Refresh listings"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
          <Link to="/ngo/browse" className="btn-primary">
            <Search size={16} /> Browse all food
          </Link>
        </div>
      </div>

      <PushSubscribePanel />

      {/* Error banner for API failures */}
      {(statsError || listError) && (
        <div className="mt-4 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          <WifiOff size={18} className="shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Could not reach the server.</span>
            <span className="ml-1">{statsError || listError}</span>
            <button
              onClick={handleRefresh}
              className="ml-2 underline font-medium hover:no-underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <KPI
          icon={<Package size={18} />}
          label="Available nearby"
          value={loading ? '…' : ready ? nearbyAll.length : '—'}
          hint={ready ? `within ${radiusKm} km` : 'waiting for location'}
          color="brand"
        />
        <KPI
          icon={<CheckCircle2 size={18} />}
          label="Accepted"
          value={stats?.accepted ?? '—'}
          hint="in progress"
          color="yellow"
        />
        <KPI
          icon={<TrendingUp size={18} />}
          label="Picked up"
          value={stats?.picked_up ?? '—'}
          hint="lifetime"
          color="blue"
        />
        <KPI
          icon={<MapPin size={18} />}
          label="Meals rescued"
          value={stats?.mealsRescued ?? '—'}
          hint="lifetime total"
          color="orange"
        />
      </div>

      {/* Map + Live Feed — split earlier (md) so tablet doesn't waste space (gap R3),
          and shorter on mobile so the feed stays above the fold (gap R2). */}
      <div className="grid md:grid-cols-[1fr_320px] lg:grid-cols-[1fr_380px] gap-4 mt-6">
        <MapPanel
          center={location}
          listings={nearbyAll}
          radiusKm={radiusKm}
          ready={ready}
          height="h-[260px] sm:h-[340px] lg:h-[420px]"
        />

        <div className="card overflow-hidden flex flex-col max-h-[420px]">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
            <div className="font-bold text-sm text-gray-900">Live Feed</div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-700 font-semibold">Live</span>
            </div>
          </div>
          <div className="overflow-y-auto p-3 space-y-2 flex-1">
            {loading ? (
              <LoadingSpinner />
            ) : !ready ? (
              <EmptyState
                icon="📍"
                title="Waiting for your location"
                description="Once granted, we'll list food drops nearest to you in real time."
              />
            ) : nearbyAll.length === 0 ? (
              <EmptyState
                icon="🍽️"
                title="No food in your area"
                description="You'll be notified the moment a restaurant nearby posts surplus."
              />
            ) : (
              nearbyAll.slice(0, 15).map((l) => (
                <Link
                  key={l.id}
                  to="/ngo/browse"
                  className="block rounded-xl border border-gray-100 p-3 hover:border-green-300 hover:bg-green-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold shrink-0">
                      Available
                    </span>
                    <span className="text-xs text-gray-500 font-medium">{l.distance.toFixed(1)} km away</span>
                  </div>
                  <div className="font-bold text-sm text-gray-900 mt-1.5 break-words">{l.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5 break-words">
                    {l.restaurant?.name} · <span className="font-semibold text-gray-700">{l.quantity} meals</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Nearby food</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {loading
              ? 'Loading…'
              : !ready
              ? 'Awaiting location…'
              : `${nearbyAll.length} listing${nearbyAll.length !== 1 ? 's' : ''} within ${radiusKm} km`}
          </p>
        </div>
        <Link to="/ngo/browse" className="text-sm font-semibold text-green-700 hover:underline">
          See all →
        </Link>
      </div>

      {loading ? (
        <div className="mt-4"><LoadingSpinner /></div>
      ) : nearby.length === 0 ? (
        <div className="card mt-3">
          <EmptyState
            icon="🍽️"
            title={ready ? 'No food nearby right now' : 'Waiting for your location'}
            description={
              locStatus === 'denied'
                ? 'Location access was denied — listings may be outside your visible radius. Enable location for accurate results.'
                : !ready
                ? 'Once your browser confirms your location, food drops near you will appear here in real time.'
                : 'As soon as a restaurant posts surplus within your area, it\'ll appear here in real time.'
            }
          />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
          {nearby.map((l) => <FoodCard key={l.id} listing={l} />)}
        </div>
      )}
    </AppShell>
  );
}
