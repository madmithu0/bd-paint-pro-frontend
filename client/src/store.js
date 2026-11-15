import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const StoreContext = createContext(null);

const STORAGE_KEYS = {
  TOKEN: 'app_v3_auth_token',
  USER: 'app_v3_user_data',
  LANG: 'app_v3_language',
  THEME: 'app_v3_theme',
};

const ALLOWED_ROLES = ['Customer', 'Mistri', 'Agent', 'Merchant'];

export const StoreProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEYS.TOKEN) || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      const parsed = saved ? JSON.parse(saved) : null;
      return parsed && ALLOWED_ROLES.includes(parsed.role) ? parsed : null;
    } catch {
      return null;
    }
  });
  const [language, setLanguage] = useState(() => localStorage.getItem(STORAGE_KEYS.LANG) || 'bn');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem(STORAGE_KEYS.THEME) === 'dark');
  const [toast, setToast] = useState(null);
  const [killState, setKillState] = useState({ globalKill: false, features: {}, isHidden: false });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANG, language);
  }, [language]);

  const loginSuccess = useCallback((authToken, userData) => {
    if (!authToken || !userData || !ALLOWED_ROLES.includes(userData.role)) {
      return false;
    }
    localStorage.setItem(STORAGE_KEYS.TOKEN, authToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
    return true;
  }, []);

  const updateUser = useCallback((updatedFields) => {
    setUser((prev) => {
      if (!prev) return null;
      const merged = { ...prev, ...updatedFields };
      if (!ALLOWED_ROLES.includes(merged.role)) return prev;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(merged));
      return merged;
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    sessionStorage.clear();
    setToken(null);
    setUser(null);
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ id: Date.now(), message, type });
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  return (
    <StoreContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token && user),
        language,
        setLanguage,
        darkMode,
        setDarkMode,
        toast,
        showToast,
        clearToast,
        killState,
        setKillState,
        loginSuccess,
        updateUser,
        logout,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
