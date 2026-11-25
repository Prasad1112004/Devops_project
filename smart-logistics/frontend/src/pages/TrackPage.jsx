import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Package, Truck, CheckCircle, Clock, AlertCircle, MapPin, ArrowLeft } from 'lucide-react';
import api from '../lib/api';

const STATUS_STEPS = ['pending', 'confirmed', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'];

const STATUS_META = {
  pending:           { label: 'Order Placed',         icon: Clock,         color: 'text-yellow-500' },
  confirmed:         { label: 'Confirmed',             icon: CheckCircle,   color: 'text-blue-500' },
  picked_up:         { label: 'Picked Up',             icon: Package,       color: 'text-indigo-500' },
  in_transit:        { label: 'In Transit',            icon: Truck,         color: 'text-brand-500' },
  out_for_delivery:  { label: 'Out for Delivery',      icon: Truck,         color: 'text-orange-500' },
  delivered:         { label: 'Delivered',             icon: CheckCircle,   color: 'text-green-500' },
  cancelled:         { label: 'Cancelled',             icon: AlertCircle,   color: 'text-red-500' },
  failed:            { label: 'Delivery Failed',       icon: AlertCircle,   color: 'text-red-500' },
};

export default function TrackPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState(id || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function search(tid) {
    if (!tid.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const { data } = await api.get(`/orders/track/${tid.trim()}`);
      setOrder(data);
    } catch (e) {
      setError(e.response?.data?.message || 'Shipment not found. Please check your tracking ID.');
    } finally {
      setLoading(false);
    }
  }

  // Auto-search if ID in URL
  useState(() => { if (id) search(id); }, []);

  function handleSubmit(e) {
    e.preventDefault();
    navigate(`/track/${trackingId}`);
    search(trackingId);
  }

  const currentStepIndex = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 transition-colors">
            <ArrowLeft size={16} /> Back to Home
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-teal-500 flex items-center justify-center">
              <Truck size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-800 dark:text-white">LogiTrack</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Search Box */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Track Your Shipment</h1>
          <p className="text-gray-500 dark:text-gray-400">Enter your tracking ID to get real-time updates</p>
        </div>

        <form onSubmit={handleSubmit} className="card mb-8">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tracking ID
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={trackingId}
                onChange={e => setTrackingId(e.target.value)}
                placeholder="e.g. LTDEMO00001"
                className="input pl-10 w-full"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary px-6 flex items-center gap-2 disabled:opacity-60">
              {loading ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Search size={16} />}
              Track
            </button>
          </div>
        </form>

        {error && (
          <div className="card border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 flex items-start gap-3 mb-6">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {order && (
          <div className="space-y-6">
            {/* Overview card */}
            <div className="card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tracking ID</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white font-mono">{order.tracking_id}</p>
                </div>
                <span className={`badge ${order.status === 'delivered' ? 'badge-success' : order.status === 'cancelled' || order.status === 'failed' ? 'badge-danger' : 'badge-primary'}`}>
                  {STATUS_META[order.status]?.label || order.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="text-gray-500 dark:text-gray-400 mb-1">From</p>
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-brand-500 mt-0.5 shrink-0" />
                    <p className="font-medium text-gray-800 dark:text-white">{order.pickup_city}</p>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 ml-5">{order.pickup_address}</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="text-gray-500 dark:text-gray-400 mb-1">To</p>
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-teal-500 mt-0.5 shrink-0" />
                    <p className="font-medium text-gray-800 dark:text-white">{order.delivery_city}</p>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 ml-5">{order.delivery_address}</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="text-gray-500 dark:text-gray-400 mb-1">Details</p>
                  <p className="font-medium text-gray-800 dark:text-white">{order.weight_kg} kg · {order.priority}</p>
                  {order.estimated_delivery && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      ETA: {new Date(order.estimated_delivery).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Progress timeline */}
            {order.status !== 'cancelled' && order.status !== 'failed' && (
              <div className="card">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-6">Delivery Progress</h3>
                <div className="relative">
                  {/* Progress bar */}
                  <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 dark:bg-gray-700 hidden sm:block" />
                  <div
                    className="absolute top-5 left-5 h-0.5 bg-gradient-to-r from-brand-500 to-teal-500 hidden sm:block transition-all duration-700"
                    style={{ width: currentStepIndex >= 0 ? `${(currentStepIndex / (STATUS_STEPS.length - 1)) * (100 - 10/STATUS_STEPS.length)}%` : '0%' }}
                  />
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 relative">
                    {STATUS_STEPS.map((step, i) => {
                      const meta = STATUS_META[step];
                      const Icon = meta.icon;
                      const done = i <= currentStepIndex;
                      const active = i === currentStepIndex;
                      return (
                        <div key={step} className="flex flex-col items-center text-center gap-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                            done ? 'bg-brand-600 border-brand-600' : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700'
                          } ${active ? 'ring-4 ring-brand-200 dark:ring-brand-900' : ''}`}>
                            <Icon size={16} className={done ? 'text-white' : 'text-gray-400'} />
                          </div>
                          <p className={`text-xs font-medium ${done ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'}`}>
                            {meta.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Event history */}
            {order.events && order.events.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Shipment History</h3>
                <ol className="relative border-l border-gray-200 dark:border-gray-700 ml-3 space-y-6">
                  {order.events.map((ev, i) => (
                    <li key={i} className="ml-6">
                      <span className="absolute -left-2 flex items-center justify-center w-4 h-4 rounded-full bg-brand-100 dark:bg-brand-900 ring-4 ring-white dark:ring-gray-900">
                        <span className="w-2 h-2 rounded-full bg-brand-600" />
                      </span>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{ev.description}</p>
                        <time className="sm:ml-auto text-xs text-gray-400">{new Date(ev.event_time).toLocaleString()}</time>
                      </div>
                      {ev.location && <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1"><MapPin size={10} />{ev.location}</p>}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Demo hint */}
        <p className="text-center text-xs text-gray-400 mt-8">
          Demo: try tracking ID <code className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">LTDEMO00001</code>
        </p>
      </main>
    </div>
  );
}
