const PREFIX = 'tripshare_';

function safeParse(value, fallback) {
  try {
    return value == null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function getItem(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return safeParse(raw, fallback);
  } catch {
    return fallback;
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeItem(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch { /* ignore */ }
}

export function clearAll(except = []) {
  try {
    const keep = new Set(except.map((k) => PREFIX + k));
    const keys = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const k = localStorage.key(i);
      if (k?.startsWith(PREFIX) && !keep.has(k)) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch { /* ignore */ }
}

// Session storage helpers
export const session = {
  get(key, fallback = null) {
    try {
      return safeParse(sessionStorage.getItem(PREFIX + key), fallback);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      sessionStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove(key) {
    try {
      sessionStorage.removeItem(PREFIX + key);
    } catch { /* ignore */ }
  },
  clear() {
    try {
      sessionStorage.clear();
    } catch { /* ignore */ }
  },
};

// Auth-specific shortcuts
export const authStorage = {
  getToken: () => localStorage.getItem('token'),
  setToken: (t) => localStorage.setItem('token', t),
  removeToken: () => localStorage.removeItem('token'),
  getUser: () => getItem('user', null),
  setUser: (u) => setItem('user', u),
  clear: () => {
    localStorage.removeItem('token');
    removeItem('user');
  },
};