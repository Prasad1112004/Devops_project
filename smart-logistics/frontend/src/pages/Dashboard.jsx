import { useEffect, useState } from 'react';
import api from '../lib/api';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Package, Truck, CheckCircle, AlertTriangle, Clock, Users } from 'lucide-react';
import Spinner from '../components/Spinner';

const COLORS = ['#14b8a6','#0d9488','#f59e0b','#ef4444','#6366f1','#64748b'];

function StatCard({ icon: Icon, label, value, color = 'bg-brand-600' }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-white">{value ?? '—'}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  const { counts, drivers, daily = [], statusDist = [] } = data || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Live overview of logistics operations</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard icon={Package}      label="Total Orders"   value={counts?.total}       color="bg-brand-600" />
        <StatCard icon={Truck}        label="In Transit"     value={counts?.in_transit}  color="bg-blue-600" />
        <StatCard icon={CheckCircle}  label="Delivered"      value={counts?.delivered}   color="bg-emerald-600" />
        <StatCard icon={AlertTriangle}label="Delayed"        value={counts?.delayed}     color="bg-amber-500" />
        <StatCard icon={Clock}        label="Pending"        value={counts?.pending}     color="bg-indigo-600" />
        <StatCard icon={Truck}        label="Active"         value={counts?.active}      color="bg-teal-600" />
        <StatCard icon={Users}        label="Drivers Total"  value={drivers?.total}      color="bg-purple-600" />
        <StatCard icon={Truck}        label="Drivers Available" value={drivers?.available} color="bg-sky-600" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Orders This Week</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" tickFormatter={d => d?.slice(5)} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders"    name="Created"   fill="#0d9488" radius={[4,4,0,0]} />
              <Bar dataKey="delivered" name="Delivered" fill="#14b8a6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusDist} dataKey="count" nameKey="status" cx="50%" cy="50%"
                outerRadius={80} label={({ status, percent }) => `${status} ${(percent*100).toFixed(0)}%`}>
                {statusDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
