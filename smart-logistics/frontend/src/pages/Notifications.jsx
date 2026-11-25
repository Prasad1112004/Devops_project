import { useEffect, useState, useCallback } from 'react';
import { Bell, CheckCheck, Package, Truck, AlertTriangle, Info, RefreshCw } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

const TYPE_META = {
  order_created:   { icon: Package,       color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-950' },
  status_update:   { icon: Truck,         color: 'text-brand-500',  bg: 'bg-brand-50 dark:bg-brand-950' },
  delay_alert:     { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950' },
  delivered:       { icon: CheckCheck,    color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-950' },
  default:         { icon: Info,          color: 'text-gray-500',   bg: 'bg-gray-50 dark:bg-gray-800' },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/dashboard/notifications?limit=50');
      setNotifications(data || []);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function markRead(id) {
    try {
      await api.patch(`/dashboard/notifications/${id}/read`);
      setNotifications(n => n.map(x => x.id === id ? { ...x, is_read: 1 } : x));
    } catch {
      toast.error('Failed to mark as read');
    }
  }

  async function markAllRead() {
    const unread = notifications.filter(n => !n.is_read);
    if (!unread.length) return;
    setMarkingAll(true);
    try {
      await Promise.all(unread.map(n => api.patch(`/dashboard/notifications/${n.id}/read`)));
      setNotifications(all => all.map(x => ({ ...x, is_read: 1 })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Some notifications could not be updated');
    } finally {
      setMarkingAll(false);
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <span className="text-sm font-semibold px-2.5 py-0.5 rounded-full bg-brand-600 text-white">{unreadCount}</span>
            )}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Stay updated on your shipments</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          {unreadCount > 0 && (
            <button onClick={markAllRead} disabled={markingAll} className="btn-primary flex items-center gap-2 text-sm disabled:opacity-60">
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="card text-center py-20">
          <Bell size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No notifications yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">You'll see shipment updates here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => {
            const meta = TYPE_META[n.type] || TYPE_META.default;
            const Icon = meta.icon;
            return (
              <div
                key={n.id}
                onClick={() => !n.is_read && markRead(n.id)}
                className={`card flex items-start gap-4 cursor-pointer transition-all hover:shadow-md ${!n.is_read ? 'border-l-4 border-l-brand-500' : 'opacity-70'}`}
              >
                <div className={`p-2.5 rounded-xl ${meta.bg} shrink-0`}>
                  <Icon size={20} className={meta.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold ${!n.is_read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                      {n.title || 'Notification'}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      {!n.is_read && <span className="w-2 h-2 rounded-full bg-brand-500" />}
                      <time className="text-xs text-gray-400">{new Date(n.created_at).toLocaleString()}</time>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{n.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
