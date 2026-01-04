import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../Context/AuthContext';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  LockClosedIcon,
  LockOpenIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Pagination from '../UI/Pagination';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STAFF',
    isActive: true
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: search || undefined
        }
      });
      
      setUsers(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Gagal mengambil data pengguna');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Password dan konfirmasi password tidak cocok');
      return;
    }

    try {
      const submitData = { ...formData };
      if (!editing && !submitData.password) {
        toast.error('Password harus diisi untuk user baru');
        return;
      }
      
      // Hapus confirmPassword sebelum dikirim
      delete submitData.confirmPassword;
      
      if (editing) {
        // Jika edit dan password kosong, hapus field password
        if (!submitData.password) {
          delete submitData.password;
        }
        await api.put(`/users/${editing.id}`, submitData);
        toast.success('Pengguna berhasil diperbarui');
      } else {
        await api.post('/users', submitData);
        toast.success('Pengguna berhasil ditambahkan');
      }
      
      setShowModal(false);
      setEditing(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'STAFF',
        isActive: true
      });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async (id, username) => {
    if (currentUser.id === id) {
      toast.error('Anda tidak dapat menghapus akun sendiri');
      return;
    }
    
    if (!window.confirm(`Apakah Anda yakin ingin menghapus pengguna "${username}"?`)) return;
    
    try {
      await api.delete(`/users/${id}`);
      toast.success('Pengguna berhasil dihapus');
      fetchUsers();
    } catch (error) {
      toast.error('Gagal menghapus pengguna');
    }
  };

  const handleToggleStatus = async (id, currentStatus, username) => {
    try {
      await api.patch(`/users/${id}/status`, { isActive: !currentStatus });
      toast.success(`Status pengguna "${username}" berhasil diubah`);
      fetchUsers();
    } catch (error) {
      toast.error('Gagal mengubah status pengguna');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'FINANCE': return 'bg-green-100 text-green-800';
      case 'STAFF': return 'bg-blue-100 text-blue-800';
      case 'RECEPTIONIST': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleName = (role) => {
    switch (role) {
      case 'ADMIN': return 'Administrator';
      case 'FINANCE': return 'Keuangan';
      case 'STAFF': return 'Staff';
      case 'RECEPTIONIST': return 'Resepsionis';
      default: return role;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna Sistem</h1>
        <button
          onClick={() => {
            setEditing(null);
            setFormData({
              username: '',
              email: '',
              password: '',
              confirmPassword: '',
              role: 'STAFF',
              isActive: true
            });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Tambah Pengguna
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari pengguna..."
            className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Dibuat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{item.username}</div>
                            <div className="text-sm text-gray-500">ID: {item.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(item.role)}`}>
                          {getRoleName(item.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.isActive 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditing(item);
                              setFormData({
                                username: item.username,
                                email: item.email,
                                password: '',
                                confirmPassword: '',
                                role: item.role,
                                isActive: item.isActive
                              });
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          
                          <button
                            onClick={() => handleToggleStatus(item.id, item.isActive, item.username)}
                            className={item.isActive ? "text-yellow-600 hover:text-yellow-900" : "text-green-600 hover:text-green-900"}
                            title={item.isActive ? "Nonaktifkan" : "Aktifkan"}
                          >
                            {item.isActive ? (
                              <LockClosedIcon className="h-5 w-5" />
                            ) : (
                              <LockOpenIcon className="h-5 w-5" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleDelete(item.id, item.username)}
                            disabled={currentUser.id === item.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
              />
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {editing ? 'Edit Pengguna' : 'Tambah Pengguna'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password {!editing && '*'}
                  </label>
                  <input
                    type="password"
                    required={!editing}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder={editing ? "Kosongkan jika tidak ingin mengubah" : ""}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Konfirmasi Password {!editing && '*'}
                  </label>
                  <input
                    type="password"
                    required={!editing}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    placeholder={editing ? "Kosongkan jika tidak ingin mengubah" : ""}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role *
                    </label>
                    <select
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                    >
                      <option value="STAFF">Staff</option>
                      <option value="FINANCE">Keuangan</option>
                      <option value="RECEPTIONIST">Resepsionis</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                    >
                      <option value={true}>Aktif</option>
                      <option value={false}>Nonaktif</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditing(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editing ? 'Simpan Perubahan' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;