import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const READ_KEY = 'zwfc.notifications.readIds';

const loadReadIds = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(READ_KEY) || '[]'));
  } catch {
    return new Set();
  }
};
const saveReadIds = (set) => {
  try {
    // Cap at 200 ids so localStorage doesn't grow forever.
    const arr = Array.from(set).slice(-200);
    localStorage.setItem(READ_KEY, JSON.stringify(arr));
  } catch {
    // ignore
  }
};

export const NotificationDropdown = () => {
  const { role, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(loadReadIds);
  const ref = useRef(null);

  const markAllRead = useCallback(() => {
    setReadIds((prev) => {
      const next = new Set(prev);
      notifications.forEach((n) => next.add(n.id));
      saveReadIds(next);
      return next;
    });
  }, [notifications]);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (!role || !profile?.id) return;

    const fetchInitial = async () => {
      try {
        if (role === 'ngo') {
          const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          const { data } = await supabase
            .from('food_listings')
            .select('id, title, quantity, created_at')
            .eq('status', 'available')
            .gte('created_at', yesterday)
            .order('created_at', { ascending: false })
            .limit(5);
          if (data) {
            setNotifications(
              data.map((d) => ({
                id: `food:${d.id}`,
                title: '🍽️ New food alert',
                body: `${d.title} (${d.quantity} meals) just posted.`,
                link: '/ngo/browse',
                time: new Date(d.created_at),
              }))
            );
          }
        } else if (role === 'restaurant') {
          const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          const { data } = await supabase
            .from('food_listings')
            .select('id, title, status, updated_at')
            .eq('restaurant_id', profile.id)
            .in('status', ['accepted', 'collected'])
            .gte('updated_at', yesterday)
            .order('updated_at', { ascending: false })
            .limit(5);
          if (data) {
            setNotifications(
              data.map((d) => ({
                id: `${d.status}:${d.id}`,
                title: d.status === 'accepted' ? '✅ Food accepted' : '🚀 Food collected',
                body:
                  d.status === 'accepted'
                    ? `An NGO accepted your listing: ${d.title}`
                    : `Your listing "${d.title}" was marked as picked up.`,
                link: '/restaurant/listings',
                time: new Date(d.updated_at),
              }))
            );
          }
        }
      } catch (err) {
        console.error('Failed to fetch initial notifications:', err);
      }
    };

    fetchInitial();

    let channel;
    if (role === 'ngo') {
      channel = supabase
        .channel('ngo_notifications')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'food_listings' }, (payload) => {
          if (payload.new.status === 'available') {
            const newNotif = {
              id: `food:${payload.new.id}`,
              title: '🍽️ New food alert',
              body: `${payload.new.title} (${payload.new.quantity} meals) just posted.`,
              link: '/ngo/browse',
              time: new Date(),
            };
            setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)]);
          }
        })
        .subscribe();
    } else if (role === 'restaurant') {
      channel = supabase
        .channel('rest_notifications')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'food_listings' }, (payload) => {
          const newRow = payload.new;
          const oldRow = payload.old;
          if (newRow.restaurant_id !== profile.id) return;
          // Only fire on the specific transitions we care about — guards against
          // false "accepted" toasts when cancel/expire rewrites status (gap F8).
          if (oldRow.status === 'available' && newRow.status === 'accepted') {
            const id = `accepted:${newRow.id}`;
            setNotifications((prev) => [
              {
                id,
                title: '✅ Food accepted',
                body: `An NGO accepted your listing: ${newRow.title}`,
                link: '/restaurant/listings',
                time: new Date(),
              },
              ...prev.filter((n) => n.id !== id),
            ]);
          } else if (oldRow.status === 'accepted' && newRow.status === 'collected') {
            const id = `collected:${newRow.id}`;
            setNotifications((prev) => [
              {
                id,
                title: '🚀 Food collected',
                body: `Your listing "${newRow.title}" was marked as picked up.`,
                link: '/restaurant/listings',
                time: new Date(),
              },
              ...prev.filter((n) => n.id !== id),
            ]);
          }
        })
        .subscribe();
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [role, profile?.id]);

  const unread = notifications.filter((n) => !readIds.has(n.id)).length;

  const toggle = () => {
    setOpen((o) => !o);
    if (!open) markAllRead();
  };

  const clearAll = () => {
    setNotifications([]);
    markAllRead();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggle}
        className="relative w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-16 sm:top-auto sm:mt-2 sm:w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-slide-up origin-top-right">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <span className="font-bold text-gray-900 text-sm">Notifications</span>
            {notifications.length > 0 && (
              <button onClick={clearAll} className="text-xs font-medium text-brand-600 hover:text-brand-800">
                Clear all
              </button>
            )}
          </div>
          <div className="max-h-[60vh] sm:max-h-[350px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 sm:p-8 text-center text-gray-500 text-sm flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
                  <Bell size={20} className="text-gray-300" />
                </div>
                <div className="font-medium text-gray-900">You&apos;re all caught up</div>
                <div className="text-[11px] text-gray-400">We&apos;ll alert you here when new activity happens.</div>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((n) => {
                  const isUnread = !readIds.has(n.id);
                  return (
                    <Link
                      key={n.id}
                      to={n.link}
                      onClick={() => setOpen(false)}
                      className={`block p-3 sm:p-4 hover:bg-brand-50 transition-colors ${isUnread ? 'bg-brand-50/30' : ''}`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <div className="text-sm font-bold text-gray-900 flex items-center gap-1.5 min-w-0">
                          {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />}
                          <span className="truncate">{n.title}</span>
                        </div>
                        <div className="text-[10px] font-medium text-gray-400 whitespace-nowrap shrink-0">
                          {n.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 leading-relaxed break-words">{n.body}</div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
