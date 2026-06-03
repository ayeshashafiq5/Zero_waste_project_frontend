import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { AppShell } from '../../components/common/AppShell';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { supabase } from '../../lib/supabase';

// Mockup #17 — Admin Analytics
// Aggregates platform-wide stats from food_listings + users + requests.
// Uses client-side queries since we're under the admin role with RLS rules that permit reads.
export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const [{ data: foods }, { count: nUsers }, { count: nNgos }, { count: nRest }] = await Promise.all([
          supabase.from('food_listings').select('status, quantity, food_type, created_at').gte('created_at', since),
          supabase.from('users').select('*', { count: 'exact', head: true }),
          supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'ngo'),
          supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'restaurant'),
        ]);

        const all = foods || [];
        const collected = all.filter((f) => f.status === 'collected');
        const expired = all.filter((f) => f.status === 'expired');
        const meals = collected.reduce((s, f) => s + (f.quantity || 0), 0);
        const matchRate = all.length === 0 ? 0 : (collected.length / all.length) * 100;

        // Daily series — last 30 days
        const daily = {};
        for (let i = 29; i >= 0; i--) {
          const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
          daily[d.toISOString().slice(0, 10)] = { rescued: 0, expired: 0 };
        }
        for (const f of all) {
          const day = f.created_at.slice(0, 10);
          if (daily[day]) {
            if (f.status === 'collected') daily[day].rescued += f.quantity || 0;
            if (f.status === 'expired') daily[day].expired += f.quantity || 0;
          }
        }
        const series = Object.entries(daily).map(([day, v]) => ({ day, ...v }));

        // Food type breakdown
        const types = { vegetarian: 0, 'non-vegetarian': 0, vegan: 0 };
        for (const f of all) if (f.food_type && types[f.food_type] !== undefined) types[f.food_type]++;
        const totalType = Object.values(types).reduce((a, b) => a + b, 0) || 1;

        setStats({
          totalListings: all.length,
          mealsRescued: meals,
          totalUsers: nUsers || 0,
          totalNgos: nNgos || 0,
          totalRestaurants: nRest || 0,
          matchRate: matchRate.toFixed(1),
          expiredCount: expired.length,
          series,
          types,
          totalType,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <AppShell><LoadingSpinner label="Crunching numbers…" /></AppShell>;
  if (!stats) return <AppShell><div className="card p-8 text-center">Failed to load analytics</div></AppShell>;

  const maxY = Math.max(...stats.series.map((d) => Math.max(d.rescued, d.expired)), 1);
  const chartW = 700, chartH = 200;

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Platform Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time view of meals, users, and impact across the network.</p>
        </div>
        <Link to="/admin" className="btn-secondary self-start sm:self-auto">← Moderation</Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6">
        <KPI label="Meals rescued" value={stats.mealsRescued.toLocaleString()} hint="30 days" />
        <KPI label="Restaurants" value={stats.totalRestaurants} hint="active" />
        <KPI label="NGOs" value={stats.totalNgos} hint="active" />
        <KPI label="Match rate" value={`${stats.matchRate}%`} hint="collected / posted" />
        <KPI label="Expired" value={stats.expiredCount} hint="last 30 days" />
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-4 mt-6">
        {/* Line chart */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-gray-900">Meals rescued · Daily</div>
              <div className="text-[11px] text-gray-500 lg:hidden">Last 30 days · scroll →</div>
              <div className="text-[11px] text-gray-500 hidden lg:block">Last 30 days</div>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-brand-600" />Rescued</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-400" />Expired</span>
            </div>
          </div>
          <div className="overflow-x-auto scrollbar-thin mt-3 -mx-1 px-1">
          <svg viewBox={`0 0 ${chartW} ${chartH + 20}`} className="w-full" style={{ minWidth: 700 }}>
            <g stroke="#f3f4f6">
              {[40, 90, 140, 190].map((y) => <line key={y} x1="0" y1={y} x2={chartW} y2={y} />)}
            </g>
            {stats.series.length > 1 && (
              <>
                <path
                  d={`M ${stats.series
                    .map((d, i) => `${(i / (stats.series.length - 1)) * chartW},${chartH - (d.rescued / maxY) * (chartH - 20)}`)
                    .join(' L ')}`}
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="2.5"
                />
                <path
                  d={`M ${stats.series
                    .map((d, i) => `${(i / (stats.series.length - 1)) * chartW},${chartH - (d.expired / maxY) * (chartH - 20)}`)
                    .join(' L ')}`}
                  fill="none"
                  stroke="#f87171"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />
              </>
            )}
            <g fill="#9ca3af" fontSize="10" textAnchor="middle">
              {[0, Math.floor(stats.series.length / 2), stats.series.length - 1].map((i) => (
                <text key={i} x={(i / (stats.series.length - 1)) * chartW} y={chartH + 15}>
                  {stats.series[i]?.day.slice(5)}
                </text>
              ))}
            </g>
          </svg>
          </div>
        </div>

        {/* Donut */}
        <div className="card p-5">
          <div className="text-sm font-bold text-gray-900">Food type mix</div>
          <div className="text-[11px] text-gray-500">Listings this month</div>
          <Donut data={stats.types} total={stats.totalType} />
          <div className="space-y-1.5 text-xs mt-2">
            <Row color="#16a34a" label="Vegetarian" pct={Math.round((stats.types.vegetarian / stats.totalType) * 100)} />
            <Row color="#f97316" label="Non-veg" pct={Math.round((stats.types['non-vegetarian'] / stats.totalType) * 100)} />
            <Row color="#3b82f6" label="Vegan" pct={Math.round((stats.types.vegan / stats.totalType) * 100)} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

const KPI = ({ label, value, hint }) => (
  <div className="card p-4">
    <div className="text-[11px] text-gray-500 font-semibold uppercase">{label}</div>
    <div className="text-2xl font-extrabold text-gray-900 mt-1">{value}</div>
    <div className="text-[11px] text-gray-500 mt-1">{hint}</div>
  </div>
);
KPI.propTypes = { label: PropTypes.string, value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), hint: PropTypes.string };

const Row = ({ color, label, pct }) => (
  <div className="flex items-center justify-between">
    <span className="flex items-center gap-2">
      <span className="w-2.5 h-2.5 rounded" style={{ background: color }} />
      {label}
    </span>
    <span className="font-semibold">{pct}%</span>
  </div>
);
Row.propTypes = { color: PropTypes.string, label: PropTypes.string, pct: PropTypes.number };

const Donut = ({ data, total }) => {
  const r = 70, c = 2 * Math.PI * r;
  let acc = 0;
  const segments = [
    { val: data.vegetarian, color: '#16a34a' },
    { val: data['non-vegetarian'], color: '#f97316' },
    { val: data.vegan, color: '#3b82f6' },
  ];
  return (
    <svg viewBox="0 0 200 200" className="w-40 h-40 mx-auto mt-2">
      <circle cx="100" cy="100" r={r} fill="none" stroke="#e5e7eb" strokeWidth="28" />
      {segments.map((s, i) => {
        const dash = (s.val / total) * c;
        const offset = -acc;
        acc += dash;
        return (
          <circle
            key={i}
            cx="100"
            cy="100"
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="28"
            strokeDasharray={`${dash} ${c}`}
            strokeDashoffset={offset}
            transform="rotate(-90 100 100)"
          />
        );
      })}
      <text x="100" y="95" textAnchor="middle" fontSize="22" fontWeight="800" fill="#111827">
        {total}
      </text>
      <text x="100" y="115" textAnchor="middle" fontSize="10" fill="#6b7280">
        listings
      </text>
    </svg>
  );
};
Donut.propTypes = {
  data: PropTypes.shape({ vegetarian: PropTypes.number, 'non-vegetarian': PropTypes.number, vegan: PropTypes.number }),
  total: PropTypes.number,
};
