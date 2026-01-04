import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { username, password });
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      toast.success('Login berhasil!');
      navigate('/dashboard');
      
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login gagal');
      return { success: false, error: error.response?.data };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    navigate('/login');
    toast.success('Logout berhasil');
  };

  const updateProfile = async (data) => {
    try {
      const response = await api.put('/auth/profile', data);
      const updatedUser = { ...user, ...response.data.user };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast.success('Profile berhasil diperbarui');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui profile');
      return { success: false };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    hasRole: (role) => user?.role === role,
    hasPermission: (permission) => {
      const rolePermissions = {
        ADMIN: ['*'],
        FINANCE: ['pembayaran:*', 'reservasi:read', 'dashboard:view', 'laporan:*'],
        STAFF: ['homestay:*', 'reservasi:read', 'dashboard:view'],
        RECEPTIONIST: ['pengunjung:*', 'reservasi:*', 'homestay:read', 'dashboard:view']
      };
      
      const permissions = rolePermissions[user?.role] || [];
      return permissions.includes('*') || permissions.includes(permission);
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};