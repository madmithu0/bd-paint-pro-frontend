import React, { Suspense, lazy, Component, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import useAuth from './hooks/useAuth';
import useKill from './hooks/useKill';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Footer from './components/Footer';
import Loading from './components/Loading';
import Toast from './components/Toast';

const APP_VERSION = 'v3.0.0 LOCK';

const HomePage = lazy(() => import('./pages/HomePage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Signup = lazy(() => import('./pages/Auth/Signup'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));
const VerifyOTP = lazy(() => import('./pages/Auth/VerifyOTP'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const JobCreate = lazy(() => import('./pages/Job/JobCreate'));
const JobList = lazy(() => import('./pages/Job/JobList'));
const JobDetails = lazy(() => import('./pages/Job/JobDetails'));
const JobCancel = lazy(() => import('./pages/Job/JobCancel'));
const JobOtp = lazy(() => import('./pages/Job/JobOtp'));
const TeamCreate = lazy(() => import('./pages/Team/TeamCreate'));
const TeamList = lazy(() => import('./pages/Team/TeamList'));
const TeamDetails = lazy(() => import('./pages/Team/TeamDetails'));
const PaymentPage = lazy(() => import('./pages/Payment/PaymentPage'));
const PaymentDetails = lazy(() => import('./pages/Payment/PaymentDetails'));
const PaymentStatus = lazy(() => import('./pages/Payment/PaymentStatus'));
const WithdrawPage = lazy(() => import('./pages/Payment/WithdrawPage'));
const AdvancePayment = lazy(() => import('./pages/Payment/AdvancePayment'));
const CouponApply = lazy(() => import('./pages/Payment/CouponApply'));
const WalletPage = lazy(() => import('./pages/Wallet/WalletPage'));
const ChatPage = lazy(() => import('./pages/Chat/ChatPage'));
const ChatList = lazy(() => import('./pages/Chat/ChatList'));
const AttendancePage = lazy(() => import('./pages/Attendance/AttendancePage'));
const AttendanceList = lazy(() => import('./pages/Attendance/AttendanceList'));
const ReviewPage = lazy(() => import('./pages/Review/ReviewPage'));
const DisputePage = lazy(() => import('./pages/Dispute/DisputePage'));
const MaterialPage = lazy(() => import('./pages/Material/MaterialPage'));
const MaterialDetails = lazy(() => import('./pages/Material/MaterialDetails'));
const NotificationPage = lazy(() => import('./pages/Notification/NotificationPage'));
const ProfilePage = lazy(() => import('./pages/Profile/ProfilePage'));
const MistriVerify = lazy(() => import('./pages/Profile/MistriVerify'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ReportPage = lazy(() => import('./pages/ReportPage'));
const InvoicePage = lazy(() => import('./pages/InvoicePage'));
const SchedulePage = lazy(() => import('./pages/SchedulePage'));
const ContractPage = lazy(() => import('./pages/Legal/ContractPage'));
const LegalPages = lazy(() => import('./pages/Legal/LegalPages'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Tier 3: Isolated Super Admin Lazy Imports
const SuperVerify = lazy(() => import('./pages/Admin/SuperVerify'));
const SuperAdminDashboard = lazy(() => import('./pages/Admin/SuperAdminDashboard'));

class ComponentErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Component Isolated Crash:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 m-4 border border-red-300 bg-red-50 text-red-700 rounded-lg text-center">
          <p className="font-semibold mb-2">Module temporarily unavailable.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Reload Module
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const ProtectedRoute = ({ children, featureKey }) => {
  const { isAuthenticated, user } = useAuth();
  const { isKilled, isHidden } = useKill(featureKey);

  if (!isAuthenticated || !user || user.role === 'SuperAdmin') {
    return <Navigate to="/login" replace />;
  }

  if (isHidden || isKilled) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="p-6 bg-amber-50 border border-amber-300 rounded-lg text-amber-800 text-center">
          <h2 className="text-lg font-bold">Service Maintenance</h2>
          <p className="text-sm mt-1">This feature is currently disabled by system policy.</p>
        </div>
      </div>
    );
  }

  return <ComponentErrorBoundary>{children}</ComponentErrorBoundary>;
};

const SuperAdminStealthGate = () => {
  const [superToken, setSuperToken] = useState(() => localStorage.getItem('superAdminToken') || '');

  const handleUnlockSuccess = (token) => {
    localStorage.setItem('superAdminToken', token);
    setSuperToken(token);
  };

  const handleSuperLogout = () => {
    localStorage.removeItem('superAdminToken');
    setSuperToken('');
  };

  if (!superToken) {
    return (
      <ComponentErrorBoundary>
        <SuperVerify onUnlockSuccess={handleUnlockSuccess} />
      </ComponentErrorBoundary>
    );
  }

  return (
    <ComponentErrorBoundary>
      <SuperAdminDashboard superToken={superToken} onLogout={handleSuperLogout} />
    </ComponentErrorBoundary>
  );
};

const AppLayout = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { globalKill } = useKill();

  const isStealthRoute = location.pathname.startsWith('/x9-super-2026');

  if (isStealthRoute) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Toast />
        <Suspense fallback={<Loading fullScreen={true} />}>
          <Routes>
            <Route path="/x9-super-2026/*" element={<SuperAdminStealthGate />} />
          </Routes>
        </Suspense>
      </div>
    );
  }

  if (globalKill) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">System Temporarily Offline</h1>
          <p className="text-slate-400 text-sm">Version {APP_VERSION} • Scheduled Maintenance Active</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100">
      <Toast />
      {isAuthenticated ? <Topbar /> : <Navbar />}
      <div className="flex flex-1">
        {isAuthenticated && <Sidebar />}
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <Suspense fallback={<Loading fullScreen={false} />}>
            <Routes>
              <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
              <Route path="/services" element={<ComponentErrorBoundary><HomePage /></ComponentErrorBoundary>} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/legal/:type" element={<LegalPages />} />
              <Route path="/contract" element={<ContractPage />} />

              {/* Dashboard & Core */}
              <Route path="/dashboard" element={<ProtectedRoute featureKey="dashboard"><Dashboard /></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute featureKey="search"><SearchPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute featureKey="settings"><SettingsPage /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute featureKey="reports"><ReportPage /></ProtectedRoute>} />
              <Route path="/invoices" element={<ProtectedRoute featureKey="invoices"><InvoicePage /></ProtectedRoute>} />
              <Route path="/schedule" element={<ProtectedRoute featureKey="schedule"><SchedulePage /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute featureKey="notifications"><NotificationPage /></ProtectedRoute>} />

              {/* Jobs */}
              <Route path="/jobs/create" element={<ProtectedRoute featureKey="jobCreate"><JobCreate /></ProtectedRoute>} />
              <Route path="/jobs" element={<ProtectedRoute featureKey="jobList"><JobList /></ProtectedRoute>} />
              <Route path="/jobs/:id" element={<ProtectedRoute featureKey="jobDetails"><JobDetails /></ProtectedRoute>} />
              <Route path="/jobs/:id/cancel" element={<ProtectedRoute featureKey="jobCancel"><JobCancel /></ProtectedRoute>} />
              <Route path="/jobs/:id/otp" element={<ProtectedRoute featureKey="jobOtp"><JobOtp /></ProtectedRoute>} />

              {/* Teams */}
              <Route path="/teams/create" element={<ProtectedRoute featureKey="teamCreate"><TeamCreate /></ProtectedRoute>} />
              <Route path="/teams" element={<ProtectedRoute featureKey="teamList"><TeamList /></ProtectedRoute>} />
              <Route path="/teams/:id" element={<ProtectedRoute featureKey="teamDetails"><TeamDetails /></ProtectedRoute>} />

              {/* Payments & Wallet */}
              <Route path="/payments" element={<ProtectedRoute featureKey="payment"><PaymentPage /></ProtectedRoute>} />
              <Route path="/payments/:id" element={<ProtectedRoute featureKey="paymentDetails"><PaymentDetails /></ProtectedRoute>} />
              <Route path="/payment-status" element={<ProtectedRoute featureKey="paymentStatus"><PaymentStatus /></ProtectedRoute>} />
              <Route path="/withdraw" element={<ProtectedRoute featureKey="withdraw"><WithdrawPage /></ProtectedRoute>} />
              <Route path="/advance-payment" element={<ProtectedRoute featureKey="advancePayment"><AdvancePayment /></ProtectedRoute>} />
              <Route path="/coupon" element={<ProtectedRoute featureKey="coupon"><CouponApply /></ProtectedRoute>} />
              <Route path="/wallet" element={<ProtectedRoute featureKey="wallet"><WalletPage /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute featureKey="chat"><ChatList /></ProtectedRoute>} />
              <Route path="/chat/:id" element={<ProtectedRoute featureKey="chat"><ChatPage /></ProtectedRoute>} />
              <Route path="/attendance" element={<ProtectedRoute featureKey="attendance"><AttendanceList /></ProtectedRoute>} />
              <Route path="/attendance/:id" element={<ProtectedRoute featureKey="attendance"><AttendancePage /></ProtectedRoute>} />
              <Route path="/reviews" element={<ProtectedRoute featureKey="review"><ReviewPage /></ProtectedRoute>} />
              <Route path="/disputes" element={<ProtectedRoute featureKey="dispute"><DisputePage /></ProtectedRoute>} />
              <Route path="/materials" element={<ProtectedRoute featureKey="material"><MaterialPage /></ProtectedRoute>} />
              <Route path="/materials/:id" element={<ProtectedRoute featureKey="materialDetails"><MaterialDetails /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute featureKey="profile"><ProfilePage /></ProtectedRoute>} />
              <Route path="/mistri-verify" element={<ProtectedRoute featureKey="mistriVerify"><MistriVerify /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

