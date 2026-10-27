import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('foodbridge_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('foodbridge_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync token to localStorage
  const saveAuth = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    if (newToken) {
      localStorage.setItem('foodbridge_token', newToken);
    } else {
      localStorage.removeItem('foodbridge_token');
    }
    if (newUser) {
      localStorage.setItem('foodbridge_user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('foodbridge_user');
    }
  };

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem('foodbridge_token')) {
      setLoading(false);
      return;
    }
    try {
      const res = await authApi.getMe();
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('foodbridge_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.warn('Session restoration failed:', err.message);
      saveAuth(null, null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email, password) => {
    try {
      const res = await authApi.login({ email, password });
      const { token: receivedToken, user: receivedUser } = res.data;
      saveAuth(receivedToken, receivedUser);
      toast.success(`Welcome back, ${receivedUser.name}!`);
      return receivedUser;
    } catch (err) {
      const msg =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please check your credentials.';
      toast.error(msg);
      throw err;
    }
  };

  const register = async (formData) => {
    try {
      const res = await authApi.register(formData);
      const { token: receivedToken, user: receivedUser } = res.data;
      saveAuth(receivedToken, receivedUser);
      toast.success('Registration successful!');
      return receivedUser;
    } catch (err) {
      const msg =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        err.message ||
        'Registration failed.';
      toast.error(msg);
      throw err;
    }
  };

  const logout = () => {
    saveAuth(null, null);
    toast.success('Signed out successfully.');
  };

  const isDonor = user?.role === 'household_donor' || user?.role === 'organization_donor';
  const isNGO = user?.role === 'ngo';
  const isVolunteer = user?.role === 'volunteer';
  const isAdmin = user?.role === 'admin';
  const isVerified = user?.verificationStatus === 'approved';

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!token && !!user,
    isDonor,
    isNGO,
    isVolunteer,
    isAdmin,
    isVerified,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
