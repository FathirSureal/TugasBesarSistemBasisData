import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../Context/AuthContext';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Pagination from '../UI/Pagination';

const HomestayManagement = () => {
  const { hasPermission } = useAuth();
  const [homestays, setHomestays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    Nama: '',
    Lokasi: '',
    JenisTiket: 'HomestayOnly',
    KategoriKamar: 'Standart',
    HargaPerMalam: '',
    HargaTiketEvent: '',
    KapasitasEvent: '',
    KapasitasKamar: '',
    Deskripsi: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  useEffect(() => {
    fetchHomestays();
  }, [pagination.page, search, filter]);

  const fetchHomestays = async () => {
    try {
      setLoading(true);
      const response = await api.get('/homestay', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: search || undefined,
          jenis: filter !== 'all' ? filter : undefined
        }
      });
      
      setHomestays(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Gagal mengambil data homestay');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        HargaPerMalam: parseFloat(formData.HargaPerMalam),
        HargaTiketEvent: parseFloat(formData.HargaTiketEvent) || 0,
        KapasitasEvent: parseInt(formData.KapasitasEvent) || 0,
        KapasitasKamar: parseInt(formData.KapasitasKamar) || 1
      };

      if (editing) {
        await api.put(`/homestay/${editing.HE_ID}`, data);
        toast.success('Homestay berhasil diperbarui');
      } else {
        await api.post('/homestay', data);
        toast.success('Homestay berhasil ditambahkan');
      }
      
      setShowModal(false);
      setEditing(null);
      setFormData({
        Nama: '',
        Lokasi: '',
        JenisTiket: 'HomestayOnly',
        KategoriKamar: 'Standart',
        HargaPerMalam: '',
        HargaTiketEvent: '',
        KapasitasEvent: '',
        KapasitasKamar: '',
        Deskripsi: ''
      });
      fetchHomestays();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus homestay ini?')) return;
    
    try {
      await api.delete(`/homestay/${id}`);
      toast.success('Homestay berhasil dihapus');
      fetchHomestays();
    } catch (error) {
      toast.error('Gagal menghapus homestay');
    }
  };

  const handleEdit = (homestay) => {
    setEditing(homestay);
    setFormData({
      Nama: homestay.Nama,
      Lokasi: homestay.Lokasi || '',
      JenisTiket: homestay.JenisTiket,
      KategoriKamar: homestay.KategoriKamar || 'Standart',
      HargaPerMalam: homestay.HargaPerMalam,
      HargaTiketEvent: homestay.HargaTiketEvent || '',
      KapasitasEvent: homestay.KapasitasEvent || '',
      KapasitasKamar: homestay.KapasitasKamar || '',
      Deskripsi: homestay.Deskripsi || ''
    });
    setShowModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getJenisTiketColor = (jenis) => {
    switch (jenis) {
      case 'HomestayOnly': return 'bg-blue-100 text-blue-800';
      case 'EventOnly': return 'bg-green-100 text-green-800';
      case 'HE': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getKategoriKamarColor = (kategori) => {
    switch (kategori) {
      case 'VIP': return 'bg-yellow-100 text-yellow-800';
      case 'Standart': return 'bg-gray-100 text-gray-800';
      case 'Family': return 'bg-pink-100 text-pink-800';
      case 'DualBed': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Homestay & Event</h1>
        {hasPermission('homestay:create') && (
          <button
            onClick={() => {
              setEditing(null);
              setFormData({
                Nama: '',
                Lokasi: '',
                JenisTiket: 'HomestayOnly',
                KategoriKamar: 'Standart',
                HargaPerMalam: '',
                HargaTiketEvent: '',
                KapasitasEvent: '',
                KapasitasKamar: '',
                Deskripsi: ''
              });
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Tambah Homestay/Event
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari homestay atau event..."
              className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Semua Jenis</option>
              <option value="HomestayOnly">Homestay Only</option>
              <option value="EventOnly">Event Only</option>
              <option value="HE">Homestay + Event</option>
            </select>
          </div>
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
                      Nama
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lokasi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jenis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Harga
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kapasitas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {homestays.map((item) => (
                    <tr key={item.HE_ID} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{item.Nama}</div>
                        <div className="text-sm text-gray-500">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getKategoriKamarColor(item.KategoriKamar)}`}>
                            {item.KategoriKamar || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.Lokasi}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getJenisTiketColor(item.JenisTiket)}`}>
                          {item.JenisTiket}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.HargaPerMalam > 0 && formatCurrency(item.HargaPerMalam)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.HargaTiketEvent > 0 && `Tiket: ${formatCurrency(item.HargaTiketEvent)}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>Kamar: {item.KapasitasKamar}</div>
                        <div>Event: {item.KapasitasEvent}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            disabled={!hasPermission('homestay:update')}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          {hasPermission('homestay:delete') && (
                            <button
                              onClick={() => handleDelete(item.HE_ID)}
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
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {editing ? 'Edit Homestay/Event' : 'Tambah Homestay/Event'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Homestay/Event *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.Nama}
                      onChange={(e) => setFormData({...formData, Nama: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lokasi
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.Lokasi}
                      onChange={(e) => setFormData({...formData, Lokasi: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jenis Tiket *
                    </label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.JenisTiket}
                      onChange={(e) => setFormData({...formData, JenisTiket: e.target.value})}
                    >
                      <option value="HomestayOnly">Homestay Only</option>
                      <option value="EventOnly">Event Only</option>
                      <option value="HE">Homestay + Event</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategori Kamar
                    </label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.KategoriKamar}
                      onChange={(e) => setFormData({...formData, KategoriKamar: e.target.value})}
                    >
                      <option value="Standart">Standart</option>
                      <option value="VIP">VIP</option>
                      <option value="Family">Family</option>
                      <option value="DualBed">Dual Bed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Harga Per Malam (Rp)
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.HargaPerMalam}
                      onChange={(e) => setFormData({...formData, HargaPerMalam: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Harga Tiket Event (Rp)
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.HargaTiketEvent}
                      onChange={(e) => setFormData({...formData, HargaTiketEvent: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kapasitas Kamar
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.KapasitasKamar}
                      onChange={(e) => setFormData({...formData, KapasitasKamar: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kapasitas Event
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.KapasitasEvent}
                      onChange={(e) => setFormData({...formData, KapasitasEvent: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.Deskripsi}
                    onChange={(e) => setFormData({...formData, Deskripsi: e.target.value})}
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

export default HomestayManagement;