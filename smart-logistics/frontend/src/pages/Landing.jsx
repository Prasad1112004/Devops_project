import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TruckIcon, Package, MapPin, BarChart3, Bell, ArrowRight, Search } from 'lucide-react';

const FEATURES = [
  { icon: Package,   title: 'Order Management',   desc: 'Create, assign and track every shipment end-to-end.' },
  { icon: MapPin,    title: 'Live Tracking',       desc: 'Real-time vehicle positions on an interactive map.' },
  { icon: BarChart3, title: 'Analytics',           desc: 'Delivery performance, delays and daily trends.' },
  { icon: Bell,      title: 'Smart Notifications', desc: 'Instant alerts for status changes and delays.' },
];

export default function Landing() {
  const navigate  = useNavigate();
  const [tid, setTid] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-brand-900 to-gray-900 text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="bg-brand-500 p-1.5 rounded-lg"><TruckIcon size={20} /></div>
          <span className="font-bold text-xl">Logi<span className="text-brand-400">Track</span></span>
        </div>
        <div className="flex gap-3">
          <Link to="/login"    className="text-sm text-gray-300 hover:text-white px-4 py-2 rounded-lg transition">Login</Link>
          <Link to="/register" className="text-sm bg-brand-600 hover:bg-brand-500 px-4 py-2 rounded-xl transition font-semibold">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 py-24 max-w-4xl mx-auto">
        <span className="inline-block text-xs font-semibold tracking-widest uppercase text-brand-400 bg-brand-900/40 px-3 py-1 rounded-full mb-6">
          Smart Logistics Platform
        </span>
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
          Deliver Smarter,<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-teal-300">Faster.</span>
        </h1>
        <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
          A complete logistics platform — manage orders, track vehicles in real time,
          and optimise every route with intelligent automation.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 font-bold px-8 py-4 rounded-xl text-lg transition">
            Start Free <ArrowRight size={20} />
          </Link>
          <Link to="/login" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 font-semibold px-8 py-4 rounded-xl text-lg transition border border-white/10">
            Sign In
          </Link>
        </div>
      </section>

      {/* Track box */}
      <section className="max-w-2xl mx-auto px-6 py-4">
        <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-6">
          <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <Search size={20} className="text-brand-400" /> Track Your Shipment
          </h2>
          <form className="flex gap-3" onSubmit={e => { e.preventDefault(); if (tid.trim()) navigate(`/track/${tid.trim().toUpperCase()}`); }}>
            <input
              value={tid} onChange={e => setTid(e.target.value)}
              placeholder="Enter tracking ID (e.g. LTDEMO00001)"
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-5 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-400"
            />
            <button type="submit" className="bg-brand-600 hover:bg-brand-500 font-bold px-6 py-3 rounded-xl transition flex items-center gap-2 whitespace-nowrap">
              Track <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-4 gap-6">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-brand-500/40 transition">
            <div className="bg-brand-600/20 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
              <Icon size={20} className="text-brand-400" />
            </div>
            <h3 className="font-semibold mb-2">{title}</h3>
            <p className="text-gray-400 text-sm">{desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-600 text-sm">
        © {new Date().getFullYear()} LogiTrack – Smart Logistics & Delivery Management
      </footer>
    </div>
  );
}
