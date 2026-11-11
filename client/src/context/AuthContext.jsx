import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setLoading(false);
    } else if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token, fetchProfile]);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  const updateUser = (updated) => {
    setUser((prev) => ({ ...prev, ...updated }));
    localStorage.setItem('user', JSON.stringify({ ...user, ...updated }));
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isDriver: user?.role === 'driver',
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateUser,
    refetchProfile: fetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;