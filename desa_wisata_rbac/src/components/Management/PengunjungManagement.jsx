import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../Context/AuthContext';
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Pagination from '../UI/Pagination';

const PengunjungManagement = () => {
  const { hasPermission } = useAuth();
  const [pengunjung, setPengunjung] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    NamaLengkap: '',
    NegaraAsal: '',
    Email: '',
    NomorHP: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  useEffect(() => {
    fetchPengunjung();
  }, [pagination.page, search]);

  const fetchPengunjung = async () => {
    try {
      setLoading(true);
      const response = await api.get('/pengunjung', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: search || undefined
        }
      });
      
      setPengunjung(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Gagal mengambil data pengunjung');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/pengunjung/${editing.PengunjungID}`, formData);
        toast.success('Pengunjung berhasil diperbarui');
      } else {
        await api.post('/pengunjung', formData);
        toast.success('Pengunjung berhasil ditambahkan');
      }
      
      setShowModal(false);
      setEditing(null);
      setFormData({
        NamaLengkap: '',
        NegaraAsal: '',
        Email: '',
        NomorHP: ''
      });
      fetchPengunjung();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pengunjung ini?')) return;
    
    try {
      await api.delete(`/pengunjung/${id}`);
      toast.success('Pengunjung berhasil dihapus');
      fetchPengunjung();
    } catch (error) {
      toast.error('Gagal menghapus pengunjung');
    }
  };

  const handleEdit = (pengunjung) => {
    setEditing(pengunjung);
    setFormData({
      NamaLengkap: pengunjung.NamaLengkap,
      NegaraAsal: pengunjung.NegaraAsal || '',
      Email: pengunjung.Email || '',
      NomorHP: pengunjung.NomorHP || ''
    });
    setShowModal(true);
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengunjung</h1>
        {hasPermission('pengunjung:create') && (
          <button
            onClick={() => {
              setEditing(null);
              setFormData({
                NamaLengkap: '',
                NegaraAsal: '',
                Email: '',
                NomorHP: ''
              });
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Tambah Pengunjung
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari pengunjung..."
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
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Lengkap
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Negara Asal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Daftar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pengunjung.map((item) => (
                    <tr key={item.PengunjungID} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.PengunjungID}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.NamaLengkap}</div>
                        <div className="text-sm text-gray-500">{item.NomorHP}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.Email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.NegaraAsal === 'Indonesia' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {item.NegaraAsal || 'Belum diisi'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(item.TanggalDaftar)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            disabled={!hasPermission('pengunjung:update')}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          {hasPermission('pengunjung:delete') && (
                            <button
                              onClick={() => handleDelete(item.PengunjungID)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
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
                {editing ? 'Edit Pengunjung' : 'Tambah Pengunjung'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.NamaLengkap}
                    onChange={(e) => setFormData({...formData, NamaLengkap: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.Email}
                    onChange={(e) => setFormData({...formData, Email: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor HP
                  </label>
                  <input
                    type="tel"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.NomorHP}
                    onChange={(e) => setFormData({...formData, NomorHP: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Negara Asal
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.NegaraAsal}
                    onChange={(e) => setFormData({...formData, NegaraAsal: e.target.value})}
                  />
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

export default PengunjungManagement;