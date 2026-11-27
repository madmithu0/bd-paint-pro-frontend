import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import useKill from '../hooks/useKill';

const ProtectedRoute = ({
  children,
  allowedRoles = [],
  featureKey = null,
  requireTerms = true,
}) => {
  const location = useLocation();
  const auth = useContext(AuthContext);
  const { isKilled } = useKill(featureKey);

  if (!auth || auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!auth.isAuthenticated || !auth.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (auth.user.accountStatus === 'Suspended' || auth.user.penaltyStatus === 'Suspended') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl p-6 text-center shadow-sm">
          <h2 className="text-lg font-bold text-red-600">Account Suspended</h2>
          <p className="text-sm text-slate-600 mt-2">
            Your account has been suspended due to policy or quality violations. Contact support for review.
          </p>
        </div>
      </div>
    );
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(auth.user.role)) {
    return <Navigate to="/" replace />;
  }

  if (featureKey && isKilled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white border border-amber-200 rounded-2xl p-6 text-center shadow-sm">
          <h2 className="text-lg font-bold text-amber-700">Feature Temporarily Disabled</h2>
          <p className="text-sm text-slate-600 mt-2">
            This service module is currently paused by platform administration. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const isLegalOrProfileRoute =
    location.pathname.startsWith('/legal') || location.pathname.startsWith('/profile');

  if (
    requireTerms &&
    auth.user.role !== 'SuperAdmin' &&
    auth.user.role !== 'Admin' &&
    !isLegalOrProfileRoute
  ) {
    if (!auth.hasAcceptedLatestTerms || !auth.isMerchantCommissionApproved) {
      return <Navigate to="/legal/terms?consentRequired=true" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
