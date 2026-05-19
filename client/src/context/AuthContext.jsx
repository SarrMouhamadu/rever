import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('rever_user');
      if (saved && saved !== 'undefined' && saved !== 'null') {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error parsing user session in AuthContext:", e);
    }
    return null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('rever_token'));

  const persistSession = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('rever_user', JSON.stringify(userData));
    localStorage.setItem('rever_token', authToken);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('rever_user');
    localStorage.removeItem('rever_token');
  }, []);

  useEffect(() => {
    const onLogout = () => logout();
    window.addEventListener('rever:logout', onLogout);
    return () => window.removeEventListener('rever:logout', onLogout);
  }, [logout]);

  useEffect(() => {
    if (token && user) {
      api.get('/api/me').catch(() => logout());
    }
  }, []);

  const login = async (loginId, password) => {
    const res = await api.post('/api/login', { login: loginId, password });
    persistSession(res.data.user, res.data.token);
    return res.data.user;
  };

  const register = async (form) => {
    const res = await api.post('/api/register', {
      firstName: form.firstName,
      lastName: form.lastName,
      contact: form.contact,
      password: form.password,
      pseudo: form.pseudo,
    });
    persistSession(res.data.user, res.data.token);
    return res.data.user;
  };

  const deleteAccount = async () => {
    await api.delete('/api/me');
    logout();
  };

  const exportData = async () => {
    const res = await api.get('/api/me/export');
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anonyme-pro-donnees-${user.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, deleteAccount, exportData, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
