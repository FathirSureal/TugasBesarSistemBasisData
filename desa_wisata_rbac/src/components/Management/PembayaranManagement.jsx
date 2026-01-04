import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../Context/AuthContext';
import {
  PlusIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  CreditCardIcon,
  ReceiptRefundIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Pagination from '../UI/Pagination';

const PembayaranManagement = () => {
  const { hasPermission } = useAuth();
  const [pembayaran, setPembayaran] = useState([]);
  const [reservasiList, setReservasiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPembayaran, setSelectedPembayaran] = useState(null);
  const [formData, setFormData] = useState({
    ReservasiID: '',
    MetodePembayaran: 'Transfer Bank',
    StatusPembayaran: 'Pending',
    Keterangan: ''
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
      const [pembayaranRes, reservasiRes] = await Promise.all([
        api.get('/pembayaran', {
          params: {
            page: pagination.page,
            limit: pagination.limit,
            search: search || undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined
          }
        }),
        api.get('/reservasi?status=Booked&limit=100')
      ]);

      setPembayaran(pembayaranRes.data.data);
      setPagination(pembayaranRes.data.pagination);
      setReservasiList(reservasiRes.data.data);
    } catch (error) {
      toast.error('Gagal mengambil data pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/pembayaran', {
        ...formData,
        TanggalBayar: new Date().toISOString()
      });
      toast.success('Pembayaran berhasil dicatat');
      setShowModal(false);
      setFormData({
        ReservasiID: '',
        MetodePembayaran: 'Transfer Bank',
        StatusPembayaran: 'Pending',
        Keterangan: ''
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/pembayaran/${id}/status`, { status });
      toast.success(`Status pembayaran berhasil diubah menjadi ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Gagal mengubah status pembayaran');
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Lunas': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Gagal': return 'bg-red-100 text-red-800';
      case 'Refund': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMetodeColor = (metode) => {
    switch (metode) {
      case 'Transfer Bank': return 'bg-blue-100 text-blue-800';
      case 'QRIS': return 'bg-green-100 text-green-800';
      case 'Tunai': return 'bg-gray-100 text-gray-800';
      case 'Credit Card': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const showPembayaranDetail = (pembayaran) => {
    setSelectedPembayaran(pembayaran);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Pembayaran</h1>
        {hasPermission('pembayaran:create') && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Tambah Pembayaran
          </button>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CreditCardIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Pembayaran</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(pembayaran.reduce((sum, item) => sum + parseFloat(item.JumlahBayar), 0))}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Lunas</p>
              <p className="text-xl font-bold text-gray-900">
                {pembayaran.filter(item => item.StatusPembayaran === 'Lunas').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ReceiptRefundIcon className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-xl font-bold text-gray-900">
                {pembayaran.filter(item => item.StatusPembayaran === 'Pending').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <XCircleIcon className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Gagal/Refund</p>
              <p className="text-xl font-bold text-gray-900">
                {pembayaran.filter(item => item.StatusPembayaran === 'Gagal' || item.StatusPembayaran === 'Refund').length}
              </p>
            </div>
          </div>
        </div>
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
              placeholder="Cari pembayaran..."
              className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="Lunas">Lunas</option>
              <option value="Pending">Pending</option>
              <option value="Gagal">Gagal</option>
              <option value="Refund">Refund</option>
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
                      ID Pembayaran
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reservasi ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jumlah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Metode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Bayar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pembayaran.map((item) => (
                    <tr key={item.PembayaranID} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        PAY-{item.PembayaranID}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        RES-{item.ReservasiID}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(item.JumlahBayar)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getMetodeColor(item.MetodePembayaran)}`}>
                          {item.MetodePembayaran}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.StatusPembayaran)}`}>
                          {item.StatusPembayaran}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(item.TanggalBayar)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => showPembayaranDetail(item)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          
                          {hasPermission('pembayaran:update') && item.StatusPembayaran === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(item.PembayaranID, 'Lunas')}
                                className="text-green-600 hover:text-green-900"
                                title="Konfirmasi Lunas"
                              >
                                <CheckCircleIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(item.PembayaranID, 'Gagal')}
                                className="text-red-600 hover:text-red-900"
                                title="Tandai Gagal"
                              >
                                <XCircleIcon className="h-5 w-5" />
                              </button>
                            </>
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

      {/* Modal Tambah Pembayaran */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Tambah Pembayaran</h2>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reservasi *
                  </label>
                  <select
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.ReservasiID}
                    onChange={(e) => setFormData({...formData, ReservasiID: e.target.value})}
                  >
                    <option value="">Pilih Reservasi</option>
                    {reservasiList.map((reservasi) => (
                      <option key={reservasi.ReservasiID} value={reservasi.ReservasiID}>
                        RES-{reservasi.ReservasiID} - {reservasi.pengunjung?.NamaLengkap} ({formatCurrency(reservasi.TotalHarga)})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Metode Pembayaran *
                  </label>
                  <select
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.MetodePembayaran}
                    onChange={(e) => setFormData({...formData, MetodePembayaran: e.target.value})}
                  >
                    <option value="Transfer Bank">Transfer Bank</option>
                    <option value="QRIS">QRIS</option>
                    <option value="Tunai">Tunai</option>
                    <option value="Credit Card">Credit Card</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status Pembayaran *
                  </label>
                  <select
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.StatusPembayaran}
                    onChange={(e) => setFormData({...formData, StatusPembayaran: e.target.value})}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Lunas">Lunas</option>
                    <option value="Gagal">Gagal</option>
                    <option value="Refund">Refund</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keterangan
                  </label>
                  <textarea
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.Keterangan}
                    onChange={(e) => setFormData({...formData, Keterangan: e.target.value})}
                    placeholder="Catatan atau keterangan tambahan..."
                  />
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
                  Simpan Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Pembayaran */}
      {showDetailModal && selectedPembayaran && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Detail Pembayaran PAY-{selectedPembayaran.PembayaranID}
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="px-6 py-4 space-y-6">
              {/* Info Pembayaran */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">ID Pembayaran</p>
                    <p className="font-medium">PAY-{selectedPembayaran.PembayaranID}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ID Reservasi</p>
                    <p className="font-medium">RES-{selectedPembayaran.ReservasiID}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Jumlah Bayar</p>
                    <p className="font-medium text-lg">{formatCurrency(selectedPembayaran.JumlahBayar)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Metode Pembayaran</p>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getMetodeColor(selectedPembayaran.MetodePembayaran)}`}>
                      {selectedPembayaran.MetodePembayaran}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status Pembayaran</p>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedPembayaran.StatusPembayaran)}`}>
                      {selectedPembayaran.StatusPembayaran}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tanggal Bayar</p>
                    <p className="font-medium">{formatDate(selectedPembayaran.TanggalBayar)}</p>
                  </div>
                </div>
                
                {selectedPembayaran.Keterangan && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">Keterangan</p>
                    <p className="mt-1 p-3 bg-white rounded border">{selectedPembayaran.Keterangan}</p>
                  </div>
                )}
              </div>

              {/* History Pembayaran */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">History Status</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Pembayaran dicatat</p>
                      <p className="text-sm text-gray-600">Sistem mencatat pembayaran baru</p>
                      <p className="text-xs text-gray-500">{formatDate(selectedPembayaran.TanggalBayar)}</p>
                    </div>
                  </div>
                </div>
              </div>
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

export default PembayaranManagement;