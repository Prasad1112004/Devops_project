import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Search, Plus, Loader2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  Pending:'badge bg-gray-100 text-gray-700', Assigned:'badge bg-blue-100 text-blue-700',
  'Picked Up':'badge bg-indigo-100 text-indigo-700', 'In Transit':'badge bg-sky-100 text-sky-700',
  'Out for Delivery':'badge bg-orange-100 text-orange-700',
  Delivered:'badge bg-green-100 text-green-700', Cancelled:'badge bg-red-100 text-red-700',
  Delayed:'badge bg-amber-100 text-amber-700',
};

export default function Orders() {
  const { user } = useAuth();
  const [data, setData]       = useState({ data:[], total:0, pages:1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('');
  const [page, setPage]       = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 20, ...(status && { status }), ...(debouncedSearch && { search: debouncedSearch }) };
    api.get('/orders', { params }).then(r => setData(r.data)).finally(() => setLoading(false));
  }, [page, status, debouncedSearch]);

  useEffect(() => { load(); }, [load]);

  const cancel = async (id) => {
    if (!confirm('Cancel this order?')) return;
    try { await api.delete(`/orders/${id}`); toast.success('Order cancelled'); load(); }
    catch { toast.error('Failed to cancel'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Orders</h1>
          <p className="text-sm text-gray-500">{data.total} total orders</p>
        </div>
        {user?.role !== 'Driver' && (
          <Link to="/app/orders/new" className="btn-primary">
            <Plus size={16} /> New Order
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search ID, customer, city…" className="input pl-9 w-64" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="input w-48">
          <option value="">All Statuses</option>
          {['Pending','Assigned','Picked Up','In Transit','Out for Delivery','Delivered','Cancelled','Delayed'].map(s =>
            <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {['Tracking ID','Customer','Route','Priority','Status','ETA','Actions'].map(h =>
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12"><Loader2 className="animate-spin mx-auto text-brand-500" /></td></tr>
              ) : data.data.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No orders found</td></tr>
              ) : data.data.map(o => (
                <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold text-brand-700 dark:text-brand-400">{o.tracking_id}</td>
                  <td className="px-5 py-3.5 text-gray-700 dark:text-gray-300">{o.customer_name || '—'}</td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs">{o.pickup_city} → {o.delivery_city}</td>
                  <td className="px-5 py-3.5">
                    <span className={`badge ${o.priority==='Express' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{o.priority}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={STATUS_COLORS[o.status] || 'badge bg-gray-100 text-gray-600'}>{o.status}</span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400">
                    {o.estimated_eta ? new Date(o.estimated_eta).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-3.5 flex items-center gap-2">
                    <Link to={`/app/orders/${o.id}`} className="btn-ghost p-1.5 rounded-lg" title="View">
                      <Eye size={15} />
                    </Link>
                    {user?.role === 'Admin' && o.status === 'Pending' && (
                      <button onClick={() => cancel(o.id)} className="text-red-500 hover:text-red-700 text-xs transition">Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {data.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-400">Page {page} of {data.pages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="btn-ghost text-xs px-3 py-1">Prev</button>
              <button onClick={() => setPage(p => Math.min(data.pages, p+1))} disabled={page===data.pages} className="btn-ghost text-xs px-3 py-1">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
