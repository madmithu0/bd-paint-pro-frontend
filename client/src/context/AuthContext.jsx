import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from '../api/axiosConfig';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [superToken, setSuperToken] = useState(() => sessionStorage.getItem('superToken') || '');
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (activeToken) => {
    if (!activeToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get('/users/profile', {
        headers: { Authorization: `Bearer ${activeToken}` },
      });
      const profileData = res.data?.user || res.data?.data || res.data;
      setUser(profileData || null);
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setToken('');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile(token);
  }, [token, fetchProfile]);

  const loginWithToken = (accessToken, refreshToken, userData) => {
    if (accessToken) {
      localStorage.setItem('token', accessToken);
      setToken(accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    if (userData) {
      setUser(userData);
      setLoading(false);
    }
  };

  const loginSuperAdmin2FA = (adminToken, adminProfile) => {
    if (adminToken) {
      sessionStorage.setItem('superToken', adminToken);
      setSuperToken(adminToken);
    }
    setUser(
      adminProfile || {
        role: 'SuperAdmin',
        superAdminId: 'SA_2026_MASTER',
        twoFactorVerified: true,
      }
    );
    setLoading(false);
  };

  const updateUserLocal = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : updatedFields));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('superToken');
    setToken('');
    setSuperToken('');
    setUser(null);
  };
  const hasAcceptedLatestTerms = Boolean(user?.termsAcceptedVersion);
  const isMerchantCommissionApproved =
    user?.role !== 'Merchant' || Boolean(user?.merchantCommissionAgreed);
  const hasVerifiedWallet = Array.isArray(user?.walletAccounts)
    ? user.walletAccounts.some((acc) => acc.isVerified === true)
    : Boolean(user?.verifiedWalletNumber);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        superToken,
        loading,
        isAuthenticated: Boolean(user && (token || superToken)),
        hasAcceptedLatestTerms,
        isMerchantCommissionApproved,
        hasVerifiedWallet,
        loginWithToken,
        loginSuperAdmin2FA,
        updateUserLocal,
        refreshProfile: () => fetchProfile(token),
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
