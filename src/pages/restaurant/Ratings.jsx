import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { AppShell } from '../../components/common/AppShell';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Pagination, PAGE_SIZE } from '../../components/common/Pagination';
import { useAuth } from '../../context/AuthContext';
import { ratingService } from '../../services/ratingService';
import { relativeTime } from '../../utils/formatTime';

// Mockup #14 — Rating History
// Shows aggregate, breakdown bars, and the list of public reviews left for this restaurant.
export default function Ratings() {
  const { profile } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!profile?.id) return;
    ratingService
      .getForUser(profile.id)
      .then(setData)
      .catch(() => setData({ ratings: [], total: 0, avg: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } }))
      .finally(() => setLoading(false));
  }, [profile?.id]);

  const filtered = !data ? [] : tab === 'all'
    ? data.ratings
    : tab === 'comments'
    ? data.ratings.filter((r) => r.comment)
    : data.ratings.filter((r) => r.stars === Number(tab));

  // Reset page when filter tab changes.
  useEffect(() => { setPage(1); }, [tab]);

  return (
    <AppShell>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Ratings & Reviews</h1>
      <p className="text-sm text-gray-500 mt-1">All public ratings NGOs have left for {profile?.name}.</p>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="grid sm:grid-cols-[240px_1fr] md:grid-cols-[280px_1fr] gap-4 mt-6">
            <div className="card p-6 text-center">
              <div className="text-5xl sm:text-6xl font-extrabold text-gray-900">{data.avg || '—'}</div>
              <Stars value={data.avg} />
              <div className="text-xs text-gray-500 mt-1">{data.total} {data.total === 1 ? 'rating' : 'ratings'}</div>
            </div>

            <div className="card p-6">
              <div className="text-sm font-bold text-gray-900">Breakdown</div>
              <div className="mt-3 space-y-2 text-xs">
                {[5, 4, 3, 2, 1].map((n) => {
                  const count = data.breakdown?.[n] || 0;
                  const pct = data.total ? Math.round((count / data.total) * 100) : 0;
                  return (
                    <div key={n} className="flex items-center gap-3">
                      <div className="w-8 text-gray-700 font-semibold">{n} ★</div>
                      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${n >= 4 ? 'bg-brand-500' : n === 3 ? 'bg-yellow-400' : 'bg-red-400'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="w-10 text-right text-gray-600">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 mt-6 overflow-x-auto scrollbar-thin max-w-full">
            {[
              { k: 'all', label: 'All' },
              { k: '5', label: '5 ★' },
              { k: '4', label: '4 ★' },
              { k: 'comments', label: 'With comments' },
            ].map((t) => (
              <button
                key={t.k}
                onClick={() => setTab(t.k)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 ${
                  tab === t.k ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="space-y-3 mt-4">
            {filtered.length === 0 ? (
              <div className="card">
                <EmptyState
                  icon="⭐"
                  title={data.total === 0 ? 'No ratings yet' : 'No reviews match this filter'}
                  description={
                    data.total === 0
                      ? 'Once an NGO confirms a pickup and rates you, the review will show up here.'
                      : 'Try a different filter.'
                  }
                />
              </div>
            ) : (
              filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((r) => (
                <div key={r.id} className="card p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-bold flex items-center justify-center">
                      {(r.rater?.name || 'N').slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <div>
                          <div className="font-bold text-gray-900 text-sm">{r.rater?.name || 'Anonymous NGO'}</div>
                          <div className="text-xs text-gray-500">{relativeTime(r.created_at)}</div>
                        </div>
                        <Stars value={r.stars} compact />
                      </div>
                      {r.comment && <p className="text-sm text-gray-700 mt-2 leading-relaxed">{r.comment}</p>}
                      {r.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {r.tags.map((t) => (
                            <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-semibold">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {filtered.length > PAGE_SIZE && (
            <Pagination total={filtered.length} page={page} onPageChange={setPage} />
          )}
        </>
      )}
    </AppShell>
  );
}

const Stars = ({ value = 0, compact = false }) => {
  const filled = Math.round(value);
  return (
    <div className={`flex items-center gap-0.5 ${compact ? 'text-base' : 'text-2xl'}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= filled ? 'text-yellow-400' : 'text-gray-300'}>★</span>
      ))}
    </div>
  );
};
Stars.propTypes = { value: PropTypes.number, compact: PropTypes.bool };
