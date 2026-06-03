const toRad = (d) => (d * Math.PI) / 180;

export const haversineDistance = (lat1, lng1, lat2, lng2) => {
  if (!Number.isFinite(lat1) || !Number.isFinite(lng1) || !Number.isFinite(lat2) || !Number.isFinite(lng2)) {
    return Infinity;
  }
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Smoother across the 10 km boundary — avoids the 9.5 → "10 km" jump (gap L12).
// < 1 km     → "320 m"
// < 100 km   → one decimal ("9.5 km", "27.4 km")
// otherwise  → integer
export const formatDistance = (km) => {
  if (km == null || !Number.isFinite(km)) return '';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 100) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
};

// Pakistan bounding box — same as backend.
export const PK_BBOX = { latMin: 23.5, latMax: 37.5, lngMin: 60.5, lngMax: 77.5 };
export const inPakistan = (lat, lng) =>
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  lat >= PK_BBOX.latMin &&
  lat <= PK_BBOX.latMax &&
  lng >= PK_BBOX.lngMin &&
  lng <= PK_BBOX.lngMax;
