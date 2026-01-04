import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { CurrencyDollarIcon, CreditCardIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const FinanceDashboard = () => {
  const [financialStats, setFinancialStats] = useState({
    totalRevenue: 0,
    pendingPayments: 0,
    completedPayments: 0,
    averageTransaction: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      const [statsRes, transactionsRes] = await Promise.all([
        api.get('/finance/stats'),
        api.get('/pembayaran?limit=10&order=desc')
      ]);

      setFinancialStats(statsRes.data);
      setRecentTransactions(transactionsRes.data.data);
    } catch (error) {
      console.error('Error fetching finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Lunas': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Gagal': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <CurrencyDollarIcon className="h-8 w-8 text-green-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Keuangan</h1>
            <p className="text-gray-600">Monitor transaksi dan pendapatan</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-10 w-10 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">Total Pendapatan</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(financialStats.totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
            <div className="flex items-center">
              <CreditCardIcon className="h-10 w-10 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">Pembayaran Selesai</p>
                <p className="text-2xl font-bold text-gray-900">
                  {financialStats.completedPayments}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-10 w-10 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-yellow-600">Rata-rata Transaksi</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(financialStats.averageTransaction)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6">
            <div className="flex items-center">
              <CreditCardIcon className="h-10 w-10 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-red-600">Menunggu Pembayaran</p>
                <p className="text-2xl font-bold text-gray-900">
                  {financialStats.pendingPayments}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Transaksi Terbaru</h3>
        </div>
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
                  Tanggal
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTransactions.map((transaction) => (
                <tr key={transaction.PembayaranID} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    PAY-{transaction.PembayaranID}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    RES-{transaction.ReservasiID}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(transaction.JumlahBayar)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {transaction.MetodePembayaran}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.StatusPembayaran)}`}>
                      {transaction.StatusPembayaran}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.TanggalBayar).toLocaleDateString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition">
          <div className="text-green-600 font-semibold text-lg">Cetak Laporan Bulanan</div>
          <div className="text-gray-600 mt-2">Generate PDF Report</div>
        </button>
        
        <button className="bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition">
          <div className="text-blue-600 font-semibold text-lg">Rekonsiliasi Pembayaran</div>
          <div className="text-gray-600 mt-2">Match transactions</div>
        </button>
        
        <button className="bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition">
          <div className="text-purple-600 font-semibold text-lg">Export ke Excel</div>
          <div className="text-gray-600 mt-2">All financial data</div>
        </button>
      </div>
    </div>
  );
};

export default FinanceDashboard;