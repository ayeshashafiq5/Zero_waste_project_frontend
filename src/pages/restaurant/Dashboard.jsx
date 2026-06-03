import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Plus, TrendingUp, Package, CheckCircle2, AlertTriangle } from 'lucide-react';
import { AppShell } from '../../components/common/AppShell';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ListingCard } from '../../components/restaurant/ListingCard';
import { useAuth } from '../../context/AuthContext';
import { useFoodListings } from '../../hooks/useFoodListings';
import { foodService } from '../../services/foodService';
import toast from 'react-hot-toast';

// Tailwind purges classnames it can't see at build time, so use a static map (no `bg-${color}` interpolation).
const COLOR_CLASSES = {
  brand: 'bg-brand-100 text-brand-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  blue: 'bg-blue-100 text-blue-700',
  orange: 'bg-orange-100 text-orange-700',
  red: 'bg-red-100 text-red-600',
  gray: 'bg-gray-100 text-gray-600',
};

const KPI = ({ icon, label, value, hint, color = 'brand' }) => (
  <div className="card p-4">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${COLOR_CLASSES[color] || COLOR_CLASSES.brand}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs text-gray-500 font-medium truncate">{label}</div>
        <div className="text-xl sm:text-2xl font-extrabold text-gray-900 truncate">{value}</div>
      </div>
    </div>
    {hint && <div className="text-xs text-gray-500 mt-2 truncate">{hint}</div>}
  </div>
);
KPI.propTypes = { icon: PropTypes.node, label: PropTypes.string, value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), hint: PropTypes.string, color: PropTypes.string };

export default function RestaurantDashboard() {
  const { profile } = useAuth();
  const { listings, loading, refresh } = useFoodListings({ scope: 'mine', restaurantId: profile?.id });
  const [stats, setStats] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    foodService.getStats().then(setStats).catch(() => setStats(null));
  }, [listings.length]);

  const handleCancel = async (id) => {
    setBusyId(id);
    try {
      await foodService.cancel(id);
      toast.success('Listing cancelled');
      refresh();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Could not cancel');
    } finally {
      setBusyId(null);
    }
  };

  const recent = listings.slice(0, 6);
  const active = listings.filter((l) => ['available', 'accepted'].includes(l.status));

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {profile?.name ? `Good day, ${profile.name.split(' ')[0]} 👋` : 'Dashboard'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Here&apos;s how your kitchen is helping the city.</p>
        </div>
        <Link to="/restaurant/post" className="btn-primary"><Plus size={16} /> Post New Food</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <KPI icon={<TrendingUp size={18} />} label="Meals donated" value={stats?.mealsDonated ?? '—'} hint="lifetime collected meals" color="brand" />
        <KPI icon={<Package size={18} />} label="Active" value={active.length} hint={`${stats?.available ?? 0} avail · ${stats?.accepted ?? 0} accepted`} color="yellow" />
        <KPI icon={<CheckCircle2 size={18} />} label="Collected" value={stats?.collected ?? 0} hint="successful pickups" color="blue" />
        <KPI icon={<AlertTriangle size={18} />} label="Expired" value={stats?.expired ?? 0} hint="missed pickups" color="red" />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Recent listings</h2>
        <Link to="/restaurant/listings" className="text-sm font-semibold text-brand-700">View all →</Link>
      </div>

      <div className="mt-3 space-y-3">
        {loading ? (
          <LoadingSpinner />
        ) : recent.length === 0 ? (
          <div className="card">
            <EmptyState
              icon="🍽️"
              title="No listings yet"
              description="Got surplus from today's service? Post your first listing and nearby NGOs will be notified instantly."
              action={
                <Link to="/restaurant/post" className="btn-primary"><Plus size={16} /> Post your first food</Link>
              }
            />
          </div>
        ) : (
          recent.map((l) => (
            <ListingCard key={l.id} listing={l} onCancel={handleCancel} busy={busyId === l.id} />
          ))
        )}
      </div>
    </AppShell>
  );
}
