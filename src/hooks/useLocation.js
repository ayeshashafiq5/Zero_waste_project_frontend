import { useEffect, useRef, useState } from 'react';

// Lahore default — used only as a *display* center when no real fix exists.
export const LAHORE = { lat: 31.5204, lng: 74.3587 };

/**
 * Geolocation hook.
 *
 *   { location, status, ready, accuracy, error, request, stop }
 *
 * - `location`     — best-known coords. While `ready` is false this is the
 *                    Lahore fallback and **must not** be used for distance
 *                    calculations (gap L3).
 * - `ready`        — true once we have a real fix (status === 'granted').
 * - `accuracy`     — meters from `pos.coords.accuracy` (gap L4).
 * - `status`       — 'idle' | 'loading' | 'granted' | 'denied' | 'fallback'.
 * - `request()`    — re-prompt the browser (re-tries even after denial).
 * - `stop()`       — clears any active watchPosition.
 *
 * Pass `watch:true` to use `watchPosition` so distances stay fresh as the
 * NGO drives toward a pickup.
 */
export const useLocation = ({ autoRequest = true, watch = false } = {}) => {
  const [location, setLocation] = useState(LAHORE);
  const [status, setStatus] = useState('idle');
  const [accuracy, setAccuracy] = useState(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const watchIdRef = useRef(null);

  const onSuccess = (pos) => {
    setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    setAccuracy(pos.coords.accuracy);
    setStatus('granted');
    setReady(true);
    setError(null);
  };

  const onError = (err) => {
    setStatus(err?.code === 1 ? 'denied' : 'fallback');
    setError(err?.message || 'Geolocation unavailable');
    setReady(false);
  };

  const stop = () => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const request = () => {
    if (!('geolocation' in navigator)) {
      setStatus('fallback');
      setError('Geolocation not supported');
      return;
    }
    setStatus('loading');
    stop();
    if (watch) {
      watchIdRef.current = navigator.geolocation.watchPosition(onSuccess, onError, {
        enableHighAccuracy: true,
        timeout: 12_000,
        maximumAge: 30_000,
      });
    } else {
      navigator.geolocation.getCurrentPosition(onSuccess, onError, {
        enableHighAccuracy: true,
        timeout: 12_000,
        maximumAge: 60_000,
      });
    }
  };

  useEffect(() => {
    if (autoRequest) request();
    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRequest, watch]);

  return { location, status, ready, accuracy, error, request, stop };
};
