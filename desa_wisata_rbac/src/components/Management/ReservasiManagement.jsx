import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../Context/AuthContext';
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Pagination from '../UI/Pagination';

const ReservasiManagement = () => {
  const { hasPermission, user } = useAuth();
  const [reservasi, setReservasi] = useState([]);
  const [pengunjungList, setPengunjungList] = useState([]);
  const [homestayList, setHomestayList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReservasi, setSelectedReservasi] = useState(null);
  const [formData, setFormData] = useState({
    PengunjungID: '',
    HE_ID: '',
    TanggalMulai: '',
    JumlahHari: 1,
    JumlahPeserta: 1
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  useEffect(() => {
    fetchData();
  }, [pagination.page, search, statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reservasiRes, pengunjungRes, homestayRes] = await Promise.all([
        api.get('/reservasi', {
          params: {
            page: pagination.page,
            limit: pagination.limit,
            search: search || undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined
          }
        }),
        api.get('/pengunjung?limit=100'),
        api.get('/homestay?limit=100')
      ]);

      setReservasi(reservasiRes.data.data);
      setPagination(reservasiRes.data.pagination);
      setPengunjungList(pengunjungRes.data.data);
      setHomestayList(homestayRes.data.data);
    } catch (error) {
      toast.error('Gagal mengambil data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reservasi', formData);
      toast.success('Reservasi berhasil dibuat');
      setShowModal(false);
      setFormData({
        PengunjungID: '',
        HE_ID: '',
        TanggalMulai: '',
        JumlahHari: 1,
        JumlahPeserta: 1
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/reservasi/${id}/status`, { status });
      toast.success(`Status berhasil diubah menjadi ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Gagal mengubah status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus reservasi ini?')) return;
    
    try {
      await api.delete(`/reservasi/${id}`);
      toast.success('Reservasi berhasil dihapus');
      fetchData();
    } catch (error) {
      toast.error('Gagal menghapus reservasi');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Booked': return 'bg-blue-100 text-blue-800';
      case 'Confirmed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const showReservasiDetail = (reservasi) => {
    setSelectedReservasi(reservasi);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Reservasi</h1>
        {hasPermission('reservasi:create') && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Buat Reservasi
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
              placeholder="Cari reservasi..."
              className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="Booked">Booked</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Completed">Completed</option>
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
                      ID Reservasi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pengunjung
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Homestay/Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reservasi.map((item) => (
                    <tr key={item.ReservasiID} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        RES-{item.ReservasiID}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.pengunjung?.NamaLengkap}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.pengunjung?.Email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {item.homestayEvent?.Nama}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.homestayEvent?.Lokasi}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(item.TanggalMulai)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.JumlahHari} hari
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(item.TotalHarga)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.Status)}`}>
                          {item.Status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => showReservasiDetail(item)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          
                          {hasPermission('reservasi:update') && item.Status === 'Booked' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(item.ReservasiID, 'Confirmed')}
                                className="text-green-600 hover:text-green-900"
                                title="Konfirmasi"
                              >
                                <CheckCircleIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(item.ReservasiID, 'Cancelled')}
                                className="text-red-600 hover:text-red-900"
                                title="Batalkan"
                              >
                                <XCircleIcon className="h-5 w-5" />
                              </button>
                            </>
                          )}
                          
                          {hasPermission('reservasi:delete') && (
                            <button
                              onClick={() => handleDelete(item.ReservasiID)}
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

      {/* Modal Buat Reservasi */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Buat Reservasi Baru</h2>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pengunjung *
                  </label>
                  <select
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.PengunjungID}
                    onChange={(e) => setFormData({...formData, PengunjungID: e.target.value})}
                  >
                    <option value="">Pilih Pengunjung</option>
                    {pengunjungList.map((pengunjung) => (
                      <option key={pengunjung.PengunjungID} value={pengunjung.PengunjungID}>
                        {pengunjung.NamaLengkap} - {pengunjung.Email}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Homestay/Event *
                  </label>
                  <select
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.HE_ID}
                    onChange={(e) => setFormData({...formData, HE_ID: e.target.value})}
                  >
                    <option value="">Pilih Homestay/Event</option>
                    {homestayList.map((homestay) => (
                      <option key={homestay.HE_ID} value={homestay.HE_ID}>
                        {homestay.Nama} - {homestay.JenisTiket}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Mulai *
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.TanggalMulai}
                    onChange={(e) => setFormData({...formData, TanggalMulai: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jumlah Hari
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.JumlahHari}
                      onChange={(e) => setFormData({...formData, JumlahHari: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jumlah Peserta
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.JumlahPeserta}
                      onChange={(e) => setFormData({...formData, JumlahPeserta: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Buat Reservasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Reservasi */}
      {showDetailModal && selectedReservasi && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Detail Reservasi RES-{selectedReservasi.ReservasiID}
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="px-6 py-4 space-y-6">
              {/* Info Pengunjung */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Informasi Pengunjung</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Nama Lengkap</p>
                      <p className="font-medium">{selectedReservasi.pengunjung?.NamaLengkap}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedReservasi.pengunjung?.Email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nomor HP</p>
                      <p className="font-medium">{selectedReservasi.pengunjung?.NomorHP || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Negara Asal</p>
                      <p className="font-medium">{selectedReservasi.pengunjung?.NegaraAsal || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Homestay */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Informasi Homestay/Event</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Nama</p>
                      <p className="font-medium">{selectedReservasi.homestayEvent?.Nama}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Lokasi</p>
                      <p className="font-medium">{selectedReservasi.homestayEvent?.Lokasi}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Jenis Tiket</p>
                      <p className="font-medium">{selectedReservasi.homestayEvent?.JenisTiket}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Kategori Kamar</p>
                      <p className="font-medium">{selectedReservasi.homestayEvent?.KategoriKamar || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail Reservasi */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Detail Reservasi</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Tanggal Mulai</p>
                      <p className="font-medium">{formatDate(selectedReservasi.TanggalMulai)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tanggal Selesai</p>
                      <p className="font-medium">{formatDate(selectedReservasi.TanggalSelesai)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Jumlah Hari</p>
                      <p className="font-medium">{selectedReservasi.JumlahHari} hari</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Jumlah Peserta</p>
                      <p className="font-medium">{selectedReservasi.JumlahPeserta} orang</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedReservasi.Status)}`}>
                        {selectedReservasi.Status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Harga</p>
                      <p className="font-medium text-lg">{formatCurrency(selectedReservasi.TotalHarga)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Pembayaran */}
              {selectedReservasi.pembayaran && selectedReservasi.pembayaran.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Informasi Pembayaran</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {selectedReservasi.pembayaran.map((pembayaran, index) => (
                      <div key={index} className="mb-4 last:mb-0">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Status Pembayaran</p>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              pembayaran.StatusPembayaran === 'Lunas' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {pembayaran.StatusPembayaran}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Metode Pembayaran</p>
                            <p className="font-medium">{pembayaran.MetodePembayaran}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservasiManagement;