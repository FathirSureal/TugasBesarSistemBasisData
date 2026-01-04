import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  FilterIcon
} from '@heroicons/react/24/outline';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const LaporanKeuangan = () => {
  const [reportData, setReportData] = useState({
    monthlyRevenue: [],
    paymentMethods: [],
    revenueByHomestay: [],
    summary: {
      totalRevenue: 0,
      averageRevenue: 0,
      growthRate: 0
    }
  });
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('monthly');

  useEffect(() => {
    fetchReportData();
  }, [dateRange, reportType]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/financial', {
        params: {
          startDate: dateRange.start,
          endDate: dateRange.end,
          type: reportType
        }
      });
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await api.get(`/reports/export/${format}`, {
        params: {
          startDate: dateRange.start,
          endDate: dateRange.end
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laporan-keuangan-${dateRange.start}-${dateRange.end}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const monthlyChartData = {
    labels: reportData.monthlyRevenue.map(item => item.month),
    datasets: [
      {
        label: 'Pendapatan (Rp)',
        data: reportData.monthlyRevenue.map(item => item.revenue),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      }
    ]
  };

  const paymentMethodChartData = {
    labels: reportData.paymentMethods.map(item => item.method),
    datasets: [
      {
        data: reportData.paymentMethods.map(item => item.count),
        backgroundColor: [
          'rgba(34, 197, 94, 0.5)',
          'rgba(59, 130, 246, 0.5)',
          'rgba(249, 115, 22, 0.5)',
          'rgba(168, 85, 247, 0.5)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(249, 115, 22)',
          'rgb(168, 85, 247)'
        ],
        borderWidth: 1
      }
    ]
  };

  const revenueByHomestayChartData = {
    labels: reportData.revenueByHomestay.slice(0, 10).map(item => item.name.substring(0, 20) + '...'),
    datasets: [
      {
        label: 'Pendapatan (Rp)',
        data: reportData.revenueByHomestay.slice(0, 10).map(item => item.revenue),
        backgroundColor: 'rgba(139, 92, 246, 0.5)',
        borderColor: 'rgb(139, 92, 246)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0
            }).format(context.raw);
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0
            }).format(value);
          }
        }
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Laporan Keuangan</h1>
              <p className="text-gray-600">Analisis pendapatan dan transaksi</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleExport('pdf')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Export PDF
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Export Excel
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-10 w-10 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">Total Pendapatan</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(reportData.summary.totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-10 w-10 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">Rata-rata Bulanan</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(reportData.summary.averageRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-10 w-10 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-yellow-600">Pertumbuhan</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData.summary.growthRate > 0 ? '+' : ''}{reportData.summary.growthRate}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-700">Periode:</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-2">
              <input
                type="date"
                className="border border-gray-300 rounded-lg p-2"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              />
              <span className="text-gray-500">sampai</span>
              <input
                type="date"
                className="border border-gray-300 rounded-lg p-2"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              />
            </div>
            <div className="flex items-center space-x-2">
              <FilterIcon className="h-5 w-5 text-gray-400" />
              <select
                className="border border-gray-300 rounded-lg p-2"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="daily">Harian</option>
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
                <option value="yearly">Tahunan</option>
              </select>
            </div>
            <button
              onClick={fetchReportData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Terapkan Filter
            </button>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pendapatan Bulanan</h3>
          {reportData.monthlyRevenue.length > 0 ? (
            <Bar data={monthlyChartData} options={chartOptions} />
          ) : (
            <p className="text-gray-500 text-center py-8">Tidak ada data untuk periode ini</p>
          )}
        </div>

        {/* Payment Methods Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Metode Pembayaran</h3>
          {reportData.paymentMethods.length > 0 ? (
            <Pie data={paymentMethodChartData} options={chartOptions} />
          ) : (
            <p className="text-gray-500 text-center py-8">Tidak ada data untuk periode ini</p>
          )}
        </div>
      </div>

      {/* Top Homestay Revenue */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">10 Homestay Teratas (Berdasarkan Pendapatan)</h3>
        {reportData.revenueByHomestay.length > 0 ? (
          <>
            <Bar data={revenueByHomestayChartData} options={chartOptions} />
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Peringkat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Homestay
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jumlah Reservasi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Pendapatan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.revenueByHomestay.slice(0, 10).map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold">
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.reservationCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(item.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-center py-8">Tidak ada data untuk periode ini</p>
        )}
      </div>

      {/* Detailed Report */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Detail Transaksi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Transaksi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deskripsi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date().toLocaleDateString('id-ID')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  PAY-001
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  Pembayaran reservasi Homestay Batik Laweyan
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    Transfer Bank
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Lunas
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(500000)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LaporanKeuangan;