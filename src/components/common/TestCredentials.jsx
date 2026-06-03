import { useState } from 'react';
import PropTypes from 'prop-types';
import { Copy, Check, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

// Demo accounts created by `npm run seed` in zero-waste-backend.
// Source of truth: zero-waste-backend/scripts/seed.js (ACCOUNTS array)
const PASSWORD = 'Demo1234!';
const ACCOUNTS = [
  {
    role: 'Restaurant',
    email: 'restaurant@demo.zwfc.app',
    icon: '🍳',
    label: 'Spice Garden',
    description: 'Posts food, sees accepted NGOs, rates pickups',
  },
  {
    role: 'NGO',
    email: 'ngo@demo.zwfc.app',
    icon: '🤝',
    label: 'Helping Hands',
    description: 'Browses food, accepts, confirms pickup, rates restaurants',
  },
  {
    role: 'Admin',
    email: 'admin@demo.zwfc.app',
    icon: '⚙️',
    label: 'Platform Admin',
    description: 'Moderates NGO verifications, views analytics',
  },
];

const Pill = ({ value, label }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch { /* ignore */ }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="group flex items-center justify-between w-full text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md px-2.5 py-1.5 text-xs font-mono transition-colors"
      aria-label={`Copy ${label}`}
    >
      <span className="truncate min-w-0">{value}</span>
      <span className="ml-2 shrink-0 text-gray-400 group-hover:text-brand-600">
        {copied ? <Check size={12} className="text-brand-600" /> : <Copy size={12} />}
      </span>
    </button>
  );
};
Pill.propTypes = { value: PropTypes.string.isRequired, label: PropTypes.string };

export const TestCredentials = ({ onFill }) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="mt-6 rounded-xl border-2 border-dashed border-yellow-300 bg-yellow-50/70 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center gap-1 bg-yellow-400 text-yellow-900 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full">
            <AlertTriangle size={10} /> For Testing Only
          </span>
          <span className="text-xs font-semibold text-yellow-900 hidden sm:inline">
            Demo accounts seeded by <code className="font-mono bg-white/60 px-1 rounded">npm run seed</code>
          </span>
        </div>
        {open ? <ChevronUp size={16} className="text-yellow-800" /> : <ChevronDown size={16} className="text-yellow-800" />}
      </button>

      {open && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2">
          {ACCOUNTS.map((acc) => (
            <div key={acc.email} className="bg-white rounded-lg border border-yellow-200 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg" aria-hidden>{acc.icon}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-gray-900">
                      {acc.role} <span className="text-gray-500 font-normal">· {acc.label}</span>
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">{acc.description}</div>
                  </div>
                </div>
                {onFill && (
                  <button
                    type="button"
                    onClick={() => onFill({ email: acc.email, password: PASSWORD })}
                    className="text-[11px] font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-md whitespace-nowrap"
                  >
                    Use →
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-1.5 mt-2">
                <Pill value={acc.email} label="email" />
                <Pill value={PASSWORD} label="password" />
              </div>
            </div>
          ))}
          <p className="text-[10px] text-yellow-900/70 leading-relaxed">
            These accounts are for QA / FYP demonstration only. Don&apos;t deploy this build to production with the credentials visible.
          </p>
        </div>
      )}
    </div>
  );
};

TestCredentials.propTypes = { onFill: PropTypes.func };
