import { useMemo } from 'react';
import { useSelector } from 'react-redux';

export const ROLES = Object.freeze({
  CUSTOMER: 'customer',
  MISTRI: 'mistri',
  AGENT: 'agent',
  MERCHANT: 'merchant',
});

export default function useAuth() {
  const auth = useSelector((state) => state?.auth);

  const value = useMemo(() => {
    const user = auth?.user || null;
    const token = auth?.token || null;
    const isAuthenticated = Boolean(auth?.isAuthenticated && token && user);
    const role = user?.role || null;

    const hasRole = (allowed) => {
      if (!isAuthenticated || !role) return false;
      const list = Array.isArray(allowed) ? allowed : [allowed];
      return list.includes(role);
    };

    const isCustomer = role === ROLES.CUSTOMER;
    const isMistri = role === ROLES.MISTRI;
    const isAgent = role === ROLES.AGENT;
    const isMerchant = role === ROLES.MERCHANT;

    return {
      user,
      token,
      role,
      isAuthenticated,
      isCustomer,
      isMistri,
      isAgent,
      isMerchant,
      hasRole,
      isLoggedIn: isAuthenticated,
    };
  }, [auth]);

  return value;
}