import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import api from './api';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import Loading from './components/Loading';
import Toast from './components/Toast';

const Login = lazy(() => import('./pages/Auth/Login'));
const Signup = lazy(() => import('./pages/Auth/Signup'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));
const VerifyOTP = lazy(() => import('./pages/Auth/VerifyOTP'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const HomePage = lazy(() => import('./pages/HomePage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ReportPage = lazy(() => import('./pages/ReportPage'));
const InvoicePage = lazy(() => import('./pages/InvoicePage'));
const SchedulePage = lazy(() => import('./pages/SchedulePage'));
const NotFound = lazy(() => import('./pages/NotFound'));

export const APP_VERSION = '1.0.0';
const API_VERSION = 'v1';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.error('App Error:', error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <button onClick={() => window.location.reload()}>Reload</button>
          <p>Version {APP_VERSION}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function useKillCheck() {
  const [killed, setKilled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.get('/kill/status')
      .then((res) => {
        if (mounted) setKilled(res?.data?.killed === true);
      })
      .catch(() => {
        if (mounted) setKilled(false);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  return { killed, loading };
}

function useHideCheck() {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    let mounted = true;
    api.get('/hide/status')
      .then((res) => {
        if (mounted) setHide(res?.data?.hide === true);
      })
      .catch(() => {
        if (mounted) setHide(false);
      });
    return () => { mounted = false; };
  }, []);

  return hide;
}

function ProtectedRoute() {
  const state = store.getState();
  const token = state?.auth?.token || localStorage.getItem('token');
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}

function MainLayout() {
  return (
    <div className="app-layout">
      <Navbar />
      <div className="app-body">
        <Sidebar />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
      <Footer version={APP_VERSION} />
      <Toast />
    </div>
  );
}

function AppRoutes() {
  const { killed, loading } = useKillCheck();
  const hide = useHideCheck();

  useEffect(() => {
    api.defaults.headers.common['X-App-Version'] = APP_VERSION;
    api.defaults.headers.common['X-Api-Version'] = API_VERSION;
  }, []);

  if (loading) return <Loading />;

  if (killed) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>Service Temporarily Unavailable</h2>
        <p>Please try again later.</p>
        <p>Version {APP_VERSION}</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/reports" element={<ReportPage />} />
              <Route path="/invoices" element={<InvoicePage />} />
              <Route path="/schedule" element={<SchedulePage />} />
            </Route>
          </Route>

          {hide ? null : null}

          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </Provider>
  );
}