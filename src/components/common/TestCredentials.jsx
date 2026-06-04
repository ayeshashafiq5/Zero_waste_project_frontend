import { useState } from 'react';
import PropTypes from 'prop-types';
import { Copy, Check, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

const PASSWORD = 'Demo1234!';
const ACCOUNTS = [
  {
    role: 'Restaurant',
    email: 'restaurant@demo.zwfc.app',
    icon: '🍳',
    label: 'Spice Garden',
    description: 'Posts food · sees NGO who accepted · rates pickup',
  },
  {
    role: 'NGO',
    email: 'ngo@demo.zwfc.app',
    icon: '🤝',
    label: 'Helping Hands',
    description: 'Browses food · accepts · confirms pickup',
  },
  {
    role: 'Admin',
    email: 'admin@demo.zwfc.app',
    icon: '⚙️',
    label: 'Platform Admin',
    description: 'Approves NGOs · views analytics',
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
      className="group flex items-center justify-between w-full text-left bg-gray-50 hover:bg-gray-100 active:bg-gray-200 border border-gray-200 rounded-md px-2.5 py-2 text-xs font-mono transition-colors min-h-[36px]"
      aria-label={`Copy ${label}`}
    >
      <span className="truncate min-w-0 pr-1">{value}</span>
      <span className="shrink-0 text-gray-400 group-hover:text-brand-600 transition-colors">
        {copied
          ? <Check size={13} className="text-brand-600" />
          : <Copy size={13} />}
      </span>
    </button>
  );
};
Pill.propTypes = { value: PropTypes.string.isRequired, label: PropTypes.string };

export const TestCredentials = ({ onFill }) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="mt-6 rounded-xl border-2 border-dashed border-yellow-300 bg-yellow-50/70 overflow-hidden">

      {/* ── Header / toggle ── */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 text-left gap-2"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <span className="inline-flex items-center gap-1 bg-yellow-400 text-yellow-900 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0">
            <AlertTriangle size={10} /> Demo only
          </span>
          <span className="text-xs font-semibold text-yellow-900 hidden sm:inline truncate">
            Test accounts — tap any card to fill login
          </span>
          <span className="text-xs font-semibold text-yellow-900 sm:hidden">
            Tap to fill login
          </span>
        </div>
        <span className="shrink-0 text-yellow-800">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {/* ── Account cards ── */}
      {open && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2">
          {ACCOUNTS.map((acc) => (
            <div
              key={acc.email}
              className="bg-white rounded-lg border border-yellow-200 p-3"
            >
              {/* Top row: icon + role/desc + Use button */}
              <div className="flex items-center gap-2">
                <span className="text-xl shrink-0 leading-none" aria-hidden>{acc.icon}</span>

                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-gray-900 leading-tight">
                    {acc.role}
                    <span className="text-gray-400 font-normal"> · {acc.label}</span>
                  </div>
                  <div className="text-[11px] text-gray-500 leading-snug mt-0.5 line-clamp-1">
                    {acc.description}
                  </div>
                </div>

                {onFill && (
                  <button
                    type="button"
                    onClick={() => onFill({ email: acc.email, password: PASSWORD })}
                    className="shrink-0 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 active:bg-brand-200 border border-brand-200 px-3 py-2 rounded-lg transition-colors min-h-[36px] min-w-[52px]"
                  >
                    Use
                  </button>
                )}
              </div>

              {/* Credential pills — email full width, password compact alongside */}
              <div className="mt-2 flex flex-col gap-1.5 sm:flex-row">
                <div className="flex-1 min-w-0">
                  <Pill value={acc.email} label="email" />
                </div>
                <div className="sm:w-[110px] shrink-0">
                  <Pill value={PASSWORD} label="password" />
                </div>
              </div>
            </div>
          ))}

          <p className="text-[10px] text-yellow-900/60 leading-relaxed pt-1">
            For QA / FYP demo only. Remove before public launch.
          </p>
        </div>
      )}
    </div>
  );
};

TestCredentials.propTypes = { onFill: PropTypes.func };
