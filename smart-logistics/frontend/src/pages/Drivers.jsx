import { useEffect, useState, useCallback } from 'react';
import { Truck, User, Package, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_BADGE = {
  available:   'badge-success',
  on_delivery: 'badge-primary',
  offline:     'badge-secondary',
};

const VEHICLE_ICON = { bike: '🛵', van: '🚐', truck: '🚛', auto: '🛺' };

export default function Drivers() {
  const { user } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dr, veh] = await Promise.all([
        api.get('/drivers?limit=100'),
        api.get('/drivers/vehicles'),
      ]);
      setDrivers(dr.data.data || []);
      setVehicles(veh.data || []);
    } catch {
      toast.error('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(driverId, status) {
    setUpdating(driverId);
    try {
      await api.patch(`/drivers/${driverId}/status`, { status });
      toast.success('Status updated');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update');
    } finally {
      setUpdating(null);
    }
  }

  const stats = {
    total: drivers.length,
    available: drivers.filter(d => d.status === 'available').length,
    on_delivery: drivers.filter(d => d.status === 'on_delivery').length,
    offline: drivers.filter(d => d.status === 'offline').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Drivers & Vehicles</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your delivery fleet</p>
        </div>
        <button onClick={load} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Drivers', value: stats.total, icon: User, color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-950' },
          { label: 'Available', value: stats.available, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950' },
          { label: 'On Delivery', value: stats.on_delivery, icon: Truck, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950' },
          { label: 'Offline', value: stats.offline, icon: XCircle, color: 'text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800' },
        ].map(s => (
          <div key={s.label} className={`card flex items-center gap-4 ${s.bg}`}>
            <div className={`${s.color}`}><s.icon size={28} /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Drivers table */}
      <div className="card overflow-hidden">
        <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Driver Roster</h2>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full" />
          </div>
        ) : drivers.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Truck size={40} className="mx-auto mb-3 opacity-30" />
            <p>No drivers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {['Driver', 'Phone', 'Vehicle', 'License', 'Status', 'Deliveries'].concat(user?.role === 'admin' ? ['Action'] : []).map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {drivers.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                          {d.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">{d.name}</p>
                          <p className="text-xs text-gray-400">{d.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{d.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1">
                        {VEHICLE_ICON[d.vehicle_type] || '🚗'} {d.vehicle_type || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{d.license_plate || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${STATUS_BADGE[d.status] || 'badge-secondary'}`}>{d.status?.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{d.total_deliveries ?? 0}</td>
                    {user?.role === 'admin' && (
                      <td className="px-4 py-3">
                        <select
                          value={d.status}
                          disabled={updating === d.id}
                          onChange={e => updateStatus(d.id, e.target.value)}
                          className="input text-xs py-1 px-2"
                        >
                          <option value="available">Available</option>
                          <option value="on_delivery">On Delivery</option>
                          <option value="offline">Offline</option>
                        </select>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Vehicles */}
      {vehicles.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><Truck size={18} className="text-brand-500" /> Vehicle Fleet</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map(v => (
              <div key={v.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-brand-400 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{VEHICLE_ICON[v.type] || '🚗'}</span>
                  <span className={`badge text-xs ${v.status === 'active' ? 'badge-success' : 'badge-secondary'}`}>{v.status}</span>
                </div>
                <p className="font-semibold text-gray-800 dark:text-white">{v.make} {v.model}</p>
                <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-1">{v.plate}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>Cap: {v.capacity_kg ? `${v.capacity_kg} kg` : '—'}</span>
                  <span>Year: {v.year || '—'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
