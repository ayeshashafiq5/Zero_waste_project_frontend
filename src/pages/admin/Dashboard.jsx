import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { ShieldCheck, X } from 'lucide-react';
import { AppShell } from '../../components/common/AppShell';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { supabase } from '../../lib/supabase';
import { relativeTime } from '../../utils/formatTime';

// Mockup #16 — Admin Moderation
// Lists unverified NGOs and lets the admin approve them (sets verified=true).
// Uses Supabase directly because the admin role bypasses RLS via service-role only on the backend;
// here we rely on the admin-role policies + our RLS rules.
export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [counts, setCounts] = useState({ pending: 0, approvedToday: 0, totalNgos: 0, totalRestaurants: 0 });

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: pending }, { count: ngoCount }, { count: restCount }, { count: approvedTodayCount }] =
        await Promise.all([
          supabase
            .from('users')
            .select('id, email, name, role, address, phone, created_at, verified')
            .eq('role', 'ngo')
            .eq('verified', false)
            .order('created_at', { ascending: false }),
          supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'ngo'),
          supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'restaurant'),
          supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('verified', true)
            .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        ]);
      setUsers(pending || []);
      setCounts({
        pending: (pending || []).length,
        approvedToday: approvedTodayCount || 0,
        totalNgos: ngoCount || 0,
        totalRestaurants: restCount || 0,
      });
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    setBusyId(id);
    try {
      const { error } = await supabase.from('users').update({ verified: true }).eq('id', id);
      if (error) throw error;
      toast.success('NGO approved');
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    const id = rejectTarget.id;
    setRejectTarget(null);
    setBusyId(id);
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
      toast.success('NGO rejected');
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusyId(null);
    }
  };
  const reject = (u) => setRejectTarget(u);

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Moderation Queue</h1>
          <p className="text-sm text-gray-500 mt-1">Review and approve new NGO accounts.</p>
        </div>
        <Link to="/admin/analytics" className="btn-secondary">View analytics →</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <Stat label="Pending review" value={counts.pending} tone="yellow" />
        <Stat label="Approved (24h)" value={counts.approvedToday} tone="brand" />
        <Stat label="Total NGOs" value={counts.totalNgos} tone="blue" />
        <Stat label="Total Restaurants" value={counts.totalRestaurants} tone="orange" />
      </div>

      {/* Mobile: card list. Desktop: real table. Avoids the invalid HTML
          flex-flow-on-tr trick that broke at <md (gap R1). */}
      <div className="mt-6">
        {loading ? (
          <div className="card"><LoadingSpinner /></div>
        ) : users.length === 0 ? (
          <div className="card"><EmptyState icon="✅" title="All caught up" description="No pending NGO verifications." /></div>
        ) : (
          <>
            {/* Mobile card view */}
            <div className="md:hidden space-y-3">
              {users.map((u) => (
                <div key={u.id} className="card p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-bold flex items-center justify-center shrink-0">
                      {(u.name || 'N').slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 break-words">{u.name}</div>
                      <div className="text-xs text-gray-500 break-words">{u.email}</div>
                    </div>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <dt className="text-gray-400 uppercase tracking-wide text-[10px]">Phone</dt>
                      <dd className="text-gray-700 break-words">{u.phone || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-400 uppercase tracking-wide text-[10px]">Submitted</dt>
                      <dd className="text-gray-700">{relativeTime(u.created_at)}</dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-gray-400 uppercase tracking-wide text-[10px]">Address</dt>
                      <dd className="text-gray-700 break-words">{u.address || '—'}</dd>
                    </div>
                  </dl>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => approve(u.id)} disabled={busyId === u.id} className="btn-primary text-xs flex-1">
                      <ShieldCheck size={14} /> Approve
                    </button>
                    <button onClick={() => reject(u)} disabled={busyId === u.id} className="btn-secondary text-xs text-red-600 border-red-200 flex-1">
                      <X size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table view */}
            <div className="hidden md:block card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-[11px] uppercase font-bold text-gray-500 tracking-wide">
                  <tr>
                    <th className="text-left px-4 py-3">NGO</th>
                    <th className="text-left px-2 py-3">Phone</th>
                    <th className="text-left px-2 py-3">Address</th>
                    <th className="text-left px-2 py-3">Submitted</th>
                    <th className="text-right px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-bold flex items-center justify-center">
                            {(u.name || 'N').slice(0, 1).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 break-words">{u.name}</div>
                            <div className="text-xs text-gray-500 break-words">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-gray-700 text-xs">{u.phone || '—'}</td>
                      <td className="px-2 py-3 text-gray-600 text-xs break-words max-w-[200px]">{u.address || '—'}</td>
                      <td className="px-2 py-3 text-xs text-gray-500">{relativeTime(u.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => approve(u.id)} disabled={busyId === u.id} className="btn-primary text-xs">
                            <ShieldCheck size={14} /> Approve
                          </button>
                          <button onClick={() => reject(u)} disabled={busyId === u.id} className="btn-secondary text-xs text-red-600 border-red-200">
                            <X size={14} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <ConfirmModal
        open={!!rejectTarget}
        title="Reject this NGO?"
        message={
          <>
            <strong>{rejectTarget?.name}</strong> will be removed permanently. They will need to re-register to apply again.
          </>
        }
        confirmText="Yes, reject"
        isDestructive={true}
        onConfirm={confirmReject}
        onCancel={() => setRejectTarget(null)}
      />
    </AppShell>
  );
}

const TONES = {
  brand: 'text-brand-700',
  yellow: 'text-yellow-700',
  blue: 'text-blue-700',
  orange: 'text-orange-700',
};
const Stat = ({ label, value, tone }) => (
  <div className="card p-4">
    <div className="text-xs text-gray-500 font-semibold uppercase truncate">{label}</div>
    <div className={`text-2xl sm:text-3xl font-extrabold mt-1 truncate ${TONES[tone] || 'text-gray-900'}`}>{value}</div>
  </div>
);
Stat.propTypes = { label: PropTypes.string, value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), tone: PropTypes.string };
