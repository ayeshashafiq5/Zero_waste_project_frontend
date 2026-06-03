import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { AppShell } from '../../components/common/AppShell';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Pagination, PAGE_SIZE } from '../../components/common/Pagination';
import { useAuth } from '../../context/AuthContext';
import { useFoodListings } from '../../hooks/useFoodListings';
import { foodService } from '../../services/foodService';
import { expiryLabel, formatDateTime } from '../../utils/formatTime';
import { ConfirmModal } from '../../components/common/ConfirmModal';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'available', label: 'Available' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'collected', label: 'Collected' },
  { key: 'expired', label: 'Expired' },
];

export default function MyListings() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { listings, loading, refresh } = useFoodListings({ scope: 'mine', restaurantId: profile?.id });
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [page, setPage] = useState(1);

  // Reset to page 1 whenever tab or search query changes.
  useEffect(() => { setPage(1); }, [tab, q]);

  const filtered = useMemo(() => {
    let l = listings;
    if (tab !== 'all') l = l.filter((x) => x.status === tab);
    if (q.trim()) l = l.filter((x) => x.title.toLowerCase().includes(q.toLowerCase()));
    return l;
  }, [listings, tab, q]);

  const counts = useMemo(
    () =>
      listings.reduce(
        (acc, x) => {
          acc.all++;
          acc[x.status] = (acc[x.status] || 0) + 1;
          return acc;
        },
        { all: 0 }
      ),
    [listings]
  );

  const cancel = async () => {
    if (!cancelTarget) return;
    const id = cancelTarget.id;
    const title = cancelTarget.title;
    setCancelTarget(null);
    setBusy(id);
    try {
      await foodService.cancel(id);
      toast.success(`"${title}" cancelled successfully`);
      refresh();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Could not cancel listing');
    } finally {
      setBusy(null);
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Listings</h1>
          <p className="text-sm text-gray-500 mt-1">Track every meal you&apos;ve posted — live updates included.</p>
        </div>
        <Link to="/restaurant/post" className="btn-primary"><Plus size={16} /> Post New Food</Link>
      </div>

      {/* Filters */}
      <div className="card p-3 mt-5 flex flex-col sm:flex-row gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title…" className="input sm:flex-1" />
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-md whitespace-nowrap ${tab === t.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'}`}
            >
              {t.label} {counts[t.key] != null && <span className="text-gray-400">{counts[t.key] || 0}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Table — desktop */}
      <div className="hidden md:block card mt-4 overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <EmptyState title="Nothing here yet" description="No listings match this filter." />
        ) : (
          <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-gray-50 text-[11px] uppercase font-bold text-gray-500 tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Food</th>
                <th className="text-left px-2 py-3">Qty</th>
                <th className="text-left px-2 py-3">Posted</th>
                <th className="text-left px-2 py-3">Expires</th>
                <th className="text-left px-2 py-3">Status</th>
                <th className="text-left px-2 py-3">NGO</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((l) => (
                <tr
                  key={l.id}
                  onClick={() => navigate(`/restaurant/listings/${l.id}`)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center overflow-hidden shrink-0">
                        {l.image_url ? (
                          <img src={l.image_url} alt={l.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg">🍽️</span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 break-words max-w-[200px]">{l.title}</div>
                        <div className="text-xs text-gray-500">{l.food_type || 'mixed'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3 font-semibold">{l.quantity}</td>
                  <td className="px-2 py-3 text-gray-600">{formatDateTime(l.created_at)}</td>
                  <td className="px-2 py-3 text-xs text-orange-500 font-semibold">
                    {['available', 'accepted'].includes(l.status) ? expiryLabel(l.expiry_time) : '—'}
                  </td>
                  <td className="px-2 py-3"><StatusBadge status={l.status} /></td>
                  <td className="px-2 py-3 text-xs">
                    {l.acceptedBy ? (
                      <div>
                        <div className="font-semibold text-gray-900 break-words max-w-[160px]">{l.acceptedBy.name}</div>
                        {l.acceptedBy.phone && <div className="text-gray-500">{l.acceptedBy.phone}</div>}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {['available', 'accepted'].includes(l.status) && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setCancelTarget(l); }}
                          disabled={busy === l.id}
                          className="text-xs text-red-600 font-semibold hover:bg-red-50 px-2 py-1 rounded"
                        >
                          Cancel
                        </button>
                      )}
                      <ChevronRight size={14} className="text-gray-400" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {filtered.length > PAGE_SIZE && (
            <div className="px-4 pb-4">
              <Pagination total={filtered.length} page={page} onPageChange={setPage} />
            </div>
          )}
          </>
        )}
      </div>

      {/* Cards — mobile */}
      <div className="md:hidden mt-4 space-y-3">
        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <div className="card"><EmptyState title="Nothing here yet" /></div>
        ) : (
          filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((l) => (
            <div key={l.id} className="card p-4">
              <Link
                to={`/restaurant/listings/${l.id}`}
                className="block hover:opacity-80 transition-opacity"
              >
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-lg bg-brand-100 flex items-center justify-center overflow-hidden shrink-0">
                    {l.image_url ? (
                      <img src={l.image_url} alt={l.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">🍽️</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-gray-900 break-words min-w-0 flex-1">{l.title}</div>
                      <StatusBadge status={l.status} />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{l.quantity} meals · {l.food_type || 'mixed'}</div>
                    <div className="text-xs text-orange-500 mt-1 font-semibold">
                      {['available', 'accepted'].includes(l.status) ? expiryLabel(l.expiry_time) : `posted ${formatDateTime(l.created_at)}`}
                    </div>
                    {l.acceptedBy && (
                      <div className="text-xs text-gray-600 mt-1 truncate">
                        <span className="text-gray-400">NGO:</span> <span className="font-semibold text-gray-900">{l.acceptedBy.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
              {['available', 'accepted'].includes(l.status) && (
                <button
                  onClick={() => setCancelTarget(l)}
                  disabled={busy === l.id}
                  className="btn-secondary mt-3 w-full text-xs"
                >
                  Cancel listing
                </button>
              )}
            </div>
          ))
        )}
        {!loading && filtered.length > PAGE_SIZE && (
          <Pagination total={filtered.length} page={page} onPageChange={setPage} />
        )}
      </div>

      <ConfirmModal
        open={!!cancelTarget}
        title="Cancel Listing"
        message={
          <>
            Are you sure you want to cancel <strong>{cancelTarget?.title}</strong>? This action cannot be undone.
          </>
        }
        confirmText="Yes, Cancel it"
        isDestructive={true}
        onConfirm={cancel}
        onCancel={() => setCancelTarget(null)}
      />
    </AppShell>
  );
}
