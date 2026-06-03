import { Bell, BellOff, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { usePushNotifications } from '../../hooks/usePushNotifications';

const DISMISS_KEY = 'zwfc.push.dismissedAt';
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const dismissedRecently = () => {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY) || 0);
    return at > 0 && Date.now() - at < DISMISS_TTL_MS;
  } catch {
    return false;
  }
};

// Subtle banner prompting NGOs to enable push notifications.
// Hides itself once subscribed, denied, or dismissed (remembered for 7 days).
export const PushSubscribePanel = () => {
  const { supported, permission, subscribed, busy, subscribe } = usePushNotifications();
  const [dismissed, setDismissed] = useState(dismissedRecently);

  if (!supported || subscribed || permission === 'denied' || dismissed) return null;

  const enable = async () => {
    const ok = await subscribe();
    if (ok) toast.success('Push notifications enabled');
    else if (Notification.permission === 'denied') toast.error('Notifications blocked in browser settings');
    else toast.error('Could not enable push (check VAPID setup)');
  };

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // ignore
    }
    setDismissed(true);
  };

  return (
    <div className="card p-4 mt-4 flex items-start gap-3 bg-gradient-to-br from-brand-50 to-emerald-50 border-brand-200">
      <div className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0">
        <Bell size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm text-gray-900">Get instant alerts when food drops nearby</div>
        <div className="text-xs text-gray-600 mt-0.5">
          Allow browser notifications so you don&apos;t miss a meal. We&apos;ll only ping you for matches in your area.
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <button onClick={enable} disabled={busy} className="btn-primary text-xs">
            {busy ? 'Enabling…' : 'Enable notifications'}
          </button>
          <button onClick={dismiss} className="btn-ghost text-xs"><BellOff size={12} /> Not now</button>
        </div>
      </div>
      <button onClick={dismiss} className="text-gray-400 hover:text-gray-600" aria-label="Dismiss">
        <X size={16} />
      </button>
    </div>
  );
};
