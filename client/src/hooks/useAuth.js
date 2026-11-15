import { useCallback } from 'react';
import { useStore } from '../store';

const ALLOWED_ROLES = ['Customer', 'Mistri', 'Agent', 'Merchant'];

export default function useAuth() {
  const { token, user, isAuthenticated, loginSuccess, updateUser, logout } = useStore();

  const hasRole = useCallback(
    (roles) => {
      if (!isAuthenticated || !user || !ALLOWED_ROLES.includes(user.role)) {
        return false;
      }
      if (Array.isArray(roles)) {
        return roles.includes(user.role);
      }
      return user.role === roles;
    },
    [isAuthenticated, user]
  );

  const isVerified = Boolean(user?.verifyStatus === true);
  const isActive = Boolean(user?.activeStatus !== false);

  return {
    token,
    user,
    role: user?.role || null,
    isAuthenticated,
    isVerified,
    isActive,
    hasRole,
    loginSuccess,
    updateUser,
    logout,
  };
}
