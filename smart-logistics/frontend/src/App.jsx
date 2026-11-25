import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/DashboardLayout';
import Spinner from './components/Spinner';

const Landing   = lazy(() => import('./pages/Landing'));
const Login     = lazy(() => import('./pages/Login'));
const Register  = lazy(() => import('./pages/Register'));
const TrackPage = lazy(() => import('./pages/TrackPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Orders    = lazy(() => import('./pages/Orders'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const CreateOrder = lazy(() => import('./pages/CreateOrder'));
const Drivers   = lazy(() => import('./pages/Drivers'));
const Tracking  = lazy(() => import('./pages/Tracking'));
const Notifications = lazy(() => import('./pages/Notifications'));

function Private({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<Spinner fullscreen />}>
        <Routes>
          <Route path="/"        element={<Landing />} />
          <Route path="/login"   element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/track/:id" element={<TrackPage />} />

          <Route path="/app" element={<Private><DashboardLayout /></Private>}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard"     element={<Dashboard />} />
            <Route path="orders"        element={<Orders />} />
            <Route path="orders/new"    element={<CreateOrder />} />
            <Route path="orders/:id"    element={<OrderDetail />} />
            <Route path="drivers"       element={<Drivers />} />
            <Route path="tracking"      element={<Tracking />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
