import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Package, Truck, MapPin, Bell,
  LogOut, Menu, X, Sun, Moon, TruckIcon
} from 'lucide-react';
import clsx from 'clsx';

const NAV = [
  { to: '/app/dashboard',     icon: LayoutDashboard, label: 'Dashboard'      },
  { to: '/app/orders',        icon: Package,          label: 'Orders'         },
  { to: '/app/drivers',       icon: Truck,            label: 'Drivers'        },
  { to: '/app/tracking',      icon: MapPin,           label: 'Live Tracking'  },
  { to: '/app/notifications', icon: Bell,             label: 'Notifications'  },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark');
    setDark(d => !d);
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className={clsx(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800',
        'flex flex-col transition-transform duration-300',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="bg-brand-600 p-1.5 rounded-lg">
            <TruckIcon size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900 dark:text-white">
            Logi<span className="text-brand-600">Track</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <div className="text-xs text-gray-500 mb-1">{user?.role}</div>
          <div className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{user?.name}</div>
          <button onClick={handleLogout}
            className="mt-3 flex items-center gap-2 text-xs text-red-500 hover:text-red-700 transition">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <button className="lg:hidden" onClick={() => setOpen(o => !o)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="ml-auto flex items-center gap-3">
            <button onClick={toggleDark} className="btn-ghost p-2 rounded-lg">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.name}</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
