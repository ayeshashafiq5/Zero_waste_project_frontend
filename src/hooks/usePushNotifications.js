import { useEffect, useState, useCallback } from 'react';
import { notificationService } from '../services/notificationService';

const urlBase64ToUint8 = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
};

// Capabilities + subscribe/unsubscribe. Falls back gracefully when:
//  - browser has no Push API / serviceWorker
//  - VAPID key isn't configured
//  - user denies permission
export const usePushNotifications = () => {
  const supported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
  const [permission, setPermission] = useState(supported ? Notification.permission : 'denied');
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supported) return;
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setSubscribed(!!sub))
      .catch(() => {});
  }, [supported]);

  const subscribe = useCallback(async () => {
    if (!supported) return false;
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') return false;

      const vapidKey =
        import.meta.env.VITE_VAPID_PUBLIC_KEY ||
        (await notificationService.getVapidPublicKey().then((d) => d?.publicKey).catch(() => null));
      if (!vapidKey) {
        console.warn('[push] no VAPID public key configured');
        return false;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8(vapidKey),
      });
      await notificationService.subscribe(sub);
      setSubscribed(true);
      return true;
    } catch (e) {
      console.warn('[push] subscribe failed:', e.message);
      return false;
    } finally {
      setBusy(false);
    }
  }, [supported]);

  const unsubscribe = useCallback(async () => {
    if (!supported) return;
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await notificationService.unsubscribe(sub.endpoint).catch(() => {});
        await sub.unsubscribe();
      }
      setSubscribed(false);
    } finally {
      setBusy(false);
    }
  }, [supported]);

  return { supported, permission, subscribed, busy, subscribe, unsubscribe };
};
