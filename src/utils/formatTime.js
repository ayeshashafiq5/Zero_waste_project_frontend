import { formatDistanceToNow, isPast, format } from 'date-fns';

export const expiryLabel = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isPast(d)) return '⚠️ Expired';
  return `⏰ in ${formatDistanceToNow(d)}`;
};

export const relativeTime = (iso) => {
  if (!iso) return '';
  return `${formatDistanceToNow(new Date(iso))} ago`;
};

export const formatDateTime = (iso) => (iso ? format(new Date(iso), 'MMM d, h:mm a') : '');

// For <input type="datetime-local">: yyyy-MM-ddTHH:mm
export const toDateTimeLocalValue = (date = new Date()) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
};
