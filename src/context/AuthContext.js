import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const STORAGE_KEY = 'movie-explorer:session';

const AuthContext = createContext(null);

const readSession = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.username ? parsed : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readSession);

  /**
   * Mock login – validates input locally and persists a session in LocalStorage.
   * Returns { ok: boolean, error?: string }.
   */
  const login = useCallback((username, password) => {
    const name = String(username || '').trim();
    if (name.length < 3) {
      return { ok: false, error: 'Username must be at least 3 characters.' };
    }
    if (!password || String(password).length < 4) {
      return { ok: false, error: 'Password must be at least 4 characters.' };
    }
    const session = {
      username: name,
      token: `mock-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`,
      loggedInAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      /* ignore quota / privacy mode errors – session still lives in memory */
    }
    setUser(session);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, logout }),
    [user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export default AuthContext;
