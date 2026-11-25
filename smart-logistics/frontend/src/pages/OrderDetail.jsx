import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, User, Truck, Clock, CheckCircle, AlertCircle, Edit2 } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending:          'badge-warning',
  confirmed:        'badge-primary',
  picked_up:        'badge-primary',
  in_transit:       'badge-primary',
  out_for_delivery: 'badge-primary',
  delivered:        'badge-success',
  cancelled:        'badge-danger',
  failed:           'badge-danger',
};

const ALL_STATUSES = ['pending','confirmed','picked_up','in_transit','out_for_delivery','delivered','cancelled','failed'];

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignDriverId, setAssignDriverId] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data);
        setNewStatus(data.status);
        setAssignDriverId(data.driver_id || '');
        if (user?.role === 'admin') {
          const dr = await api.get('/drivers?limit=100');
          setDrivers(dr.data.data || []);
        }
      } catch {
        toast.error('Order not found');
        navigate('/app/orders');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleAssign() {
    if (!assignDriverId) return;
    setUpdating(true);
    try {
      await api.patch(`/orders/${id}/assign`, { driver_id: assignDriverId });
      toast.success('Driver assigned successfully');
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to assign driver');
    } finally {
      setUpdating(false);
    }
  }

  async function handleStatusUpdate() {
    setUpdating(true);
    try {
      await api.patch(`/orders/${id}/status`, { status: newStatus });
      toast.success('Status updated');
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full" />
    </div>
  );

  if (!order) return null;

  const canUpdateStatus = user?.role === 'admin' || user?.role === 'driver';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/app/orders')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order #{order.tracking_id}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Created {new Date(order.created_at).toLocaleString()}</p>
        </div>
        <span className={`badge ${STATUS_COLORS[order.status] || 'badge-secondary'}`}>{order.status.replace(/_/g, ' ')}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="md:col-span-2 space-y-6">
          {/* Route */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><MapPin size={18} className="text-brand-500" /> Route</h3>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400">Pickup</p>
                <p className="font-semibold text-gray-800 dark:text-white">{order.pickup_city}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{order.pickup_address}</p>
              </div>
              <div className="text-brand-500">→</div>
              <div className="flex-1 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400">Delivery</p>
                <p className="font-semibold text-gray-800 dark:text-white">{order.delivery_city}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{order.delivery_address}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          {order.items && order.items.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><Package size={18} className="text-brand-500" /> Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left pb-2 text-gray-500 dark:text-gray-400">Description</th>
                      <th className="text-center pb-2 text-gray-500 dark:text-gray-400">Qty</th>
                      <th className="text-right pb-2 text-gray-500 dark:text-gray-400">Weight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {order.items.map((item, i) => (
                      <tr key={i}>
                        <td className="py-2 text-gray-800 dark:text-white">{item.description}</td>
                        <td className="py-2 text-center text-gray-600 dark:text-gray-400">{item.quantity}</td>
                        <td className="py-2 text-right text-gray-600 dark:text-gray-400">{item.weight_kg ? `${item.weight_kg} kg` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Event history */}
          {order.events && order.events.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><Clock size={18} className="text-brand-500" /> Tracking History</h3>
              <ol className="relative border-l border-gray-200 dark:border-gray-700 ml-3 space-y-5">
                {order.events.map((ev, i) => (
                  <li key={i} className="ml-6">
                    <span className="absolute -left-2 flex items-center justify-center w-4 h-4 rounded-full bg-brand-100 dark:bg-brand-900 ring-4 ring-white dark:ring-gray-900">
                      <span className="w-2 h-2 rounded-full bg-brand-600" />
                    </span>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{ev.description}</p>
                    <p className="text-xs text-gray-400">{new Date(ev.event_time).toLocaleString()}</p>
                    {ev.location && <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><MapPin size={10} />{ev.location}</p>}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Package info */}
          <div className="card space-y-3 text-sm">
            <h3 className="font-semibold text-gray-800 dark:text-white">Package Details</h3>
            <div className="flex justify-between"><span className="text-gray-500">Weight</span><span className="font-medium text-gray-800 dark:text-white">{order.weight_kg} kg</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Priority</span><span className="font-medium text-gray-800 dark:text-white">{order.priority}</span></div>
            {order.estimated_delivery && (
              <div className="flex justify-between"><span className="text-gray-500">ETA</span><span className="font-medium text-gray-800 dark:text-white">{new Date(order.estimated_delivery).toLocaleDateString()}</span></div>
            )}
            {order.notes && <div><p className="text-gray-500 mb-1">Notes</p><p className="text-gray-700 dark:text-gray-300 text-xs">{order.notes}</p></div>}
          </div>

          {/* Driver info */}
          <div className="card space-y-3 text-sm">
            <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2"><User size={16} className="text-brand-500" /> Driver</h3>
            {order.driver_name ? (
              <p className="text-gray-800 dark:text-white font-medium">{order.driver_name}</p>
            ) : (
              <p className="text-gray-400 italic">No driver assigned yet</p>
            )}

            {/* Admin assign driver */}
            {user?.role === 'admin' && order.status !== 'delivered' && order.status !== 'cancelled' && (
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
                <label className="label text-xs">Assign Driver</label>
                <select value={assignDriverId} onChange={e => setAssignDriverId(e.target.value)} className="input w-full text-sm">
                  <option value="">Select driver…</option>
                  {drivers.filter(d => d.status === 'available').map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.vehicle_type || 'Vehicle'})</option>
                  ))}
                </select>
                <button onClick={handleAssign} disabled={!assignDriverId || updating} className="btn-primary w-full text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                  {updating ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Truck size={14} />}
                  Assign
                </button>
              </div>
            )}
          </div>

          {/* Status update */}
          {canUpdateStatus && order.status !== 'delivered' && order.status !== 'cancelled' && (
            <div className="card space-y-3 text-sm">
              <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2"><Edit2 size={16} className="text-brand-500" /> Update Status</h3>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="input w-full">
                {ALL_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
              <button onClick={handleStatusUpdate} disabled={newStatus === order.status || updating} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
                {updating ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <CheckCircle size={14} />}
                Update
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
