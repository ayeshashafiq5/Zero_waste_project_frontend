import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatDistance } from '../../utils/distance';

// Fix Vite/Webpack broken default icon paths — known Leaflet issue
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

// ─── Custom coloured pin icons ────────────────────────────────────────────────

const makePin = (color) =>
  new L.DivIcon({
    className: '',
    html: `<div style="
      width:28px;height:28px;
      border-radius:50% 50% 50% 0;
      background:${color};
      border:2.5px solid white;
      transform:rotate(-45deg);
      box-shadow:0 2px 6px rgba(0,0,0,.30);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -32],
  });

const USER_ICON = new L.DivIcon({
  className: '',
  html: `<div style="
    width:20px;height:20px;
    border-radius:50%;
    background:#2563eb;
    border:3px solid white;
    box-shadow:0 0 0 5px rgba(37,99,235,.22);
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const ICON_AVAILABLE = makePin('#16a34a'); // green-600
const ICON_ACCEPTED  = makePin('#f59e0b'); // amber-500

// ─── Internal helper: re-centers the Leaflet map when `center` prop changes ──

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng]);
  return null;
}

RecenterMap.propTypes = {
  center: PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number }).isRequired,
};

// ─── Public component ─────────────────────────────────────────────────────────

/**
 * Live map of nearby food drops — powered by Leaflet + OpenStreetMap (free, no API key).
 *
 * Props are identical to the previous Google Maps version so every caller
 * (NGODashboard, Browse, etc.) continues to work without any changes.
 */
export const MapPanel = ({ center, listings = [], radiusKm = 10, height = 'h-[420px]', ready = true }) => {
  const [selected, setSelected] = useState(null);

  const visible       = listings.filter((l) => Number.isFinite(l.lat) && Number.isFinite(l.lng));
  const availableCount = visible.filter((l) => l.status === 'available').length;

  return (
    <div className={`relative w-full ${height} rounded-2xl overflow-hidden border border-gray-200 shadow-sm`}>

      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        zoomControl
        attributionControl
      >
        {/* Free OpenStreetMap tiles — ODbL licence requires attribution */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
          maxZoom={19}
        />

        {/* Keep map centred as location resolves */}
        <RecenterMap center={center} />

        {/* Service-radius circle — hidden until geolocation resolves */}
        {ready && (
          <Circle
            center={[center.lat, center.lng]}
            radius={radiusKm * 1000}
            pathOptions={{
              color: '#3b82f6',
              weight: 1.5,
              opacity: 0.5,
              fillColor: '#3b82f6',
              fillOpacity: 0.06,
            }}
          />
        )}

        {/* User's current location pin */}
        {ready && (
          <Marker
            position={[center.lat, center.lng]}
            icon={USER_ICON}
            zIndexOffset={999}
          />
        )}

        {/* Food listing pins */}
        {visible.map((l) => (
          <Marker
            key={l.id}
            position={[l.lat, l.lng]}
            icon={l.status === 'available' ? ICON_AVAILABLE : ICON_ACCEPTED}
            eventHandlers={{ click: () => setSelected(selected?.id === l.id ? null : l) }}
          >
            <Popup>
              <div style={{ minWidth: 160, fontFamily: 'Inter, sans-serif' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>
                  {l.title}
                </div>
                <div style={{ color: '#6b7280', fontSize: 11, marginTop: 2 }}>
                  {l.restaurant?.name || 'Restaurant'}
                </div>
                <div style={{ fontSize: 11, marginTop: 4, color: '#374151' }}>
                  <b>{l.quantity}</b> meals
                  {l.distance != null ? ` · ${formatDistance(l.distance)}` : ''}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: 9999,
                    fontSize: 10,
                    fontWeight: 700,
                    background: l.status === 'available' ? '#dcfce7' : '#fef3c7',
                    color:      l.status === 'available' ? '#15803d'  : '#92400e',
                  }}
                >
                  {l.status}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* ── Overlay badges (float above the Leaflet controls) ─────────────── */}

      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-md px-3 py-2 text-xs font-semibold text-gray-700 flex items-center gap-2 z-[1000] pointer-events-none">
        <span className={`w-2 h-2 rounded-full ${ready ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`} />
        {ready ? `Your area · ${radiusKm} km radius` : 'Detecting location…'}
      </div>

      {availableCount > 0 && (
        <div className="absolute top-3 right-3 bg-green-600 text-white rounded-xl shadow-md px-3 py-2 text-xs font-bold flex items-center gap-1.5 z-[1000] pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-white/70 inline-block" />
          {availableCount} available nearby
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-8 left-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-md p-3 text-xs space-y-1.5 max-w-[190px] z-[1000] pointer-events-none">
        <div className="font-bold text-gray-900 mb-1">Map legend</div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white shadow-sm inline-block" />
          <span className="text-gray-600">Your location</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-green-600 border-2 border-white shadow-sm inline-block" />
          <span className="text-gray-600">Available food</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white shadow-sm inline-block" />
          <span className="text-gray-600">Accepted</span>
        </div>
      </div>

      {visible.length === 0 && (
        <div className="absolute inset-x-0 bottom-3 mx-3 bg-white/95 rounded-xl shadow-md px-3 py-2 text-xs text-gray-600 z-[1000] pointer-events-none text-center">
          No food in your area right now — you&apos;ll be alerted when a restaurant posts nearby.
        </div>
      )}
    </div>
  );
};

MapPanel.propTypes = {
  center:   PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number }).isRequired,
  listings: PropTypes.array,
  radiusKm: PropTypes.number,
  height:   PropTypes.string,
  ready:    PropTypes.bool,
};
