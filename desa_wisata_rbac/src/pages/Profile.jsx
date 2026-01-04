import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import {
  UserCircleIcon,
  EnvelopeIcon,
  KeyIcon,
  ShieldCheckIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Password baru dan konfirmasi password tidak cocok');
      return;
    }

    try {
      const updateData = {
        username: formData.username,
        email: formData.email
      };

      if (formData.currentPassword && formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const result = await updateProfile(updateData);
      if (result.success) {
        setEditMode(false);
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <UserCircleIcon className="h-12 w-12 text-gray-600 mr-4" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile Saya</h1>
              <p className="text-gray-600">Kelola informasi akun Anda</p>
            </div>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {editMode ? 'Batal Edit' : 'Edit Profile'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Pribadi</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!editMode}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    disabled={!editMode}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              {/* Role Info (Read Only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <div className="flex items-center space-x-2">
                  <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user?.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                    user?.role === 'FINANCE' ? 'bg-green-100 text-green-800' :
                    user?.role === 'STAFF' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {user?.role === 'ADMIN' ? 'Administrator' :
                     user?.role === 'FINANCE' ? 'Keuangan' :
                     user?.role === 'STAFF' ? 'Staff' :
                     'Resepsionis'}
                  </span>
                </div>
              </div>

              {/* Account Created */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Akun Dibuat
                </label>
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-600">
                    {user?.createdAt ? formatDate(user.createdAt) : '-'}
                  </span>
                </div>
              </div>

              {/* Password Change Section */}
              {editMode && (
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Ubah Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password Saat Ini
                      </label>
                      <input
                        type="password"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                        placeholder="Kosongkan jika tidak ingin mengubah"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password Baru
                        </label>
                        <input
                          type="password"
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={formData.newPassword}
                          onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Konfirmasi Password Baru
                        </label>
                        <input
                          type="password"
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {editMode && (
                <div className="pt-4 border-t">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Sidebar - Account Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Akun</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                  Aktif
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Last Login</span>
                <span className="text-gray-900 font-medium">
                  {formatDate(new Date().toISOString())}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">IP Address</span>
                <span className="text-gray-900 font-medium">192.168.1.1</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Keamanan</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <KeyIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">Password</span>
                </div>
                <span className="text-sm text-gray-500">●●●●●●●●</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">Email Terverifikasi</span>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                  Ya
                </span>
              </div>
              <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
                Lihat Aktivitas Login
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hak Akses</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Manajemen Pengunjung</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  user?.role === 'ADMIN' || user?.role === 'RECEPTIONIST' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user?.role === 'ADMIN' || user?.role === 'RECEPTIONIST' ? 'Diizinkan' : 'Dilarang'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Manajemen Homestay</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  user?.role === 'ADMIN' || user?.role === 'STAFF' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user?.role === 'ADMIN' || user?.role === 'STAFF' ? 'Diizinkan' : 'Dilarang'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Manajemen Pembayaran</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  user?.role === 'ADMIN' || user?.role === 'FINANCE' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user?.role === 'ADMIN' || user?.role === 'FINANCE' ? 'Diizinkan' : 'Dilarang'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;