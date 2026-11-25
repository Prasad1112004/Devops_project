import { useEffect, useState, useCallback } from 'react';
import { MapPin, Truck, Package, RefreshCw, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../lib/api';
import toast from 'react-hot-toast';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// City coordinates map for demo
const CITY_COORDS = {
  Mumbai:    [19.0760, 72.8777],
  Delhi:     [28.6139, 77.2090],
  Bangalore: [12.9716, 77.5946],
  Chennai:   [13.0827, 80.2707],
  Hyderabad: [17.3850, 78.4867],
  Kolkata:   [22.5726, 88.3639],
  Pune:      [18.5204, 73.8567],
  Ahmedabad: [23.0225, 72.5714],
  Jaipur:    [26.9124, 75.7873],
  Lucknow:   [26.8467, 80.9462],
  Surat:     [21.1702, 72.8311],
  Nagpur:    [21.1458, 79.0882],
};

const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});
const deliveryIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const STATUS_COLOR = {
  pending: 'badge-warning',
  in_transit: 'badge-primary',
  out_for_delivery: 'badge-primary',
  delivered: 'badge-success',
  cancelled: 'badge-danger',
};

export default function Tracking() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders?limit=50&status=in_transit');
      const active = (data.data || []).filter(o =>
        (o.pickup_city && CITY_COORDS[o.pickup_city]) ||
        (o.delivery_city && CITY_COORDS[o.delivery_city])
      );
      setOrders(active);
      if (active.length && !selected) setSelected(active[0]);
    } catch {
      toast.error('Failed to load active orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const pickupCoords = selected && CITY_COORDS[selected.pickup_city];
  const deliveryCoords = selected && CITY_COORDS[selected.delivery_city];
  const mapCenter = pickupCoords || [20.5937, 78.9629]; // India center

  return (
    <div className="space-y-4 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Live Tracking</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View active shipments on the map</p>
        </div>
        <button onClick={load} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ minHeight: 500 }}>
        {/* Sidebar */}
        <div className="lg:col-span-1 card overflow-y-auto" style={{ maxHeight: 580 }}>
          <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
            <Navigation size={16} className="text-brand-500" /> Active Shipments
            <span className="ml-auto badge badge-primary">{orders.length}</span>
          </h3>
          {loading ? (
            <div className="flex items-center justify-center h-24">
              <div className="animate-spin w-6 h-6 border-4 border-brand-600 border-t-transparent rounded-full" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Truck size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No active shipments</p>
              <p className="text-xs mt-1">In-transit orders appear here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.map(o => (
                <div
                  key={o.id}
                  onClick={() => setSelected(o)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${selected?.id === o.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-950' : 'border-gray-200 dark:border-gray-700 hover:border-brand-300'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">{o.tracking_id}</span>
                    <span className={`badge text-xs ${STATUS_COLOR[o.status] || 'badge-secondary'}`}>{o.status?.replace(/_/g,' ')}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <MapPin size={10} className="text-blue-400" /> {o.pickup_city}
                    <span className="mx-1">→</span>
                    <MapPin size={10} className="text-green-400" /> {o.delivery_city}
                  </div>
                  {o.driver_name && <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Truck size={10}/> {o.driver_name}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="lg:col-span-2 card overflow-hidden p-0 rounded-2xl" style={{ minHeight: 500 }}>
          <MapContainer
            center={mapCenter}
            zoom={5}
            style={{ height: '100%', minHeight: 500, width: '100%' }}
            className="rounded-2xl"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {orders.map(o => {
              const pc = CITY_COORDS[o.pickup_city];
              const dc = CITY_COORDS[o.delivery_city];
              return (
                <div key={o.id}>
                  {pc && (
                    <Marker position={pc} icon={pickupIcon}>
                      <Popup>
                        <div className="text-sm">
                          <p className="font-bold">{o.tracking_id}</p>
                          <p>📦 Pickup: {o.pickup_city}</p>
                          <p className="text-xs text-gray-500">{o.pickup_address}</p>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                  {dc && (
                    <Marker position={dc} icon={deliveryIcon}>
                      <Popup>
                        <div className="text-sm">
                          <p className="font-bold">{o.tracking_id}</p>
                          <p>🏁 Delivery: {o.delivery_city}</p>
                          <p className="text-xs text-gray-500">{o.delivery_address}</p>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                  {pc && dc && (
                    <Polyline
                      positions={[pc, dc]}
                      color={selected?.id === o.id ? '#3b82f6' : '#94a3b8'}
                      weight={selected?.id === o.id ? 3 : 1.5}
                      dashArray={selected?.id === o.id ? undefined : '6 4'}
                    />
                  )}
                </div>
              );
            })}
          </MapContainer>
        </div>
      </div>

      {/* Selected order detail */}
      {selected && (
        <div className="card">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Package size={18} className="text-brand-500" /> Selected: {selected.tracking_id}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><p className="text-gray-400 text-xs">From</p><p className="font-medium text-gray-800 dark:text-white">{selected.pickup_city}</p></div>
            <div><p className="text-gray-400 text-xs">To</p><p className="font-medium text-gray-800 dark:text-white">{selected.delivery_city}</p></div>
            <div><p className="text-gray-400 text-xs">Weight</p><p className="font-medium text-gray-800 dark:text-white">{selected.weight_kg} kg</p></div>
            <div><p className="text-gray-400 text-xs">Driver</p><p className="font-medium text-gray-800 dark:text-white">{selected.driver_name || '—'}</p></div>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        🗺️ Map uses OpenStreetMap. City coordinates are approximated for demonstration purposes.
      </p>
    </div>
  );
}
