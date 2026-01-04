import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Cog6ToothIcon, 
  ServerIcon, 
  ShieldCheckIcon,
  ChartBarIcon,
  ClockIcon,
  DatabaseIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const [systemInfo, setSystemInfo] = useState({
    version: '1.0.0',
    uptime: '0 hari',
    totalUsers: 0,
    totalRecords: 0,
    lastBackup: 'Belum ada',
    performance: 'Baik'
  });
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchSystemInfo();
    fetchAuditLogs();
  }, []);

  const fetchSystemInfo = async () => {
    try {
      const response = await api.get('/admin/system-info');
      setSystemInfo(response.data);
    } catch (error) {
      console.error('Error fetching system info:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await api.get('/admin/audit-logs?limit=10');
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  const handleOptimizeDatabase = async () => {
    try {
      await api.post('/admin/optimize-db');
      toast.success('Optimasi database berhasil dilakukan');
    } catch (error) {
      toast.error('Gagal melakukan optimasi database');
    }
  };

  const handleClearCache = async () => {
    try {
      await api.post('/admin/clear-cache');
      toast.success('Cache berhasil dibersihkan');
    } catch (error) {
      toast.error('Gagal membersihkan cache');
    }
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
          <Cog6ToothIcon className="h-8 w-8 text-gray-700 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600">Pengaturan dan monitoring sistem</p>
          </div>
        </div>

        {/* System Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <ServerIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-600">System Version</p>
                <p className="text-2xl font-bold text-gray-900">{systemInfo.version}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">Status: <span className="font-medium text-green-600">Online</span></p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <ClockIcon className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-600">Uptime</p>
                <p className="text-2xl font-bold text-gray-900">{systemInfo.uptime}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">Last restart: {systemInfo.lastRestart}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <DatabaseIcon className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-purple-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{systemInfo.totalRecords.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">Database: MySQL</p>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button
            onClick={handleOptimizeDatabase}
            className="bg-white border border-gray-300 rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
          >
            <DatabaseIcon className="h-10 w-10 text-blue-600 mx-auto mb-3" />
            <div className="font-semibold text-gray-900">Optimize Database</div>
            <div className="text-sm text-gray-600 mt-1">Rebuild indexes & cleanup</div>
          </button>

          <button
            onClick={handleClearCache}
            className="bg-white border border-gray-300 rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
          >
            <ServerIcon className="h-10 w-10 text-green-600 mx-auto mb-3" />
            <div className="font-semibold text-gray-900">Clear Cache</div>
            <div className="text-sm text-gray-600 mt-1">Clear all system cache</div>
          </button>

          <button className="bg-white border border-gray-300 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
            <ShieldCheckIcon className="h-10 w-10 text-red-600 mx-auto mb-3" />
            <div className="font-semibold text-gray-900">Security Scan</div>
            <div className="text-sm text-gray-600 mt-1">Run security audit</div>
          </button>

          <button className="bg-white border border-gray-300 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
            <ChartBarIcon className="h-10 w-10 text-purple-600 mx-auto mb-3" />
            <div className="font-semibold text-gray-900">Generate Report</div>
            <div className="text-sm text-gray-600 mt-1">System performance</div>
          </button>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Audit Logs Terakhir</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Waktu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{log.user?.username}</div>
                    <div className="text-xs text-gray-500">{log.user?.role}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      log.action === 'create' ? 'bg-green-100 text-green-800' :
                      log.action === 'update' ? 'bg-blue-100 text-blue-800' :
                      log.action === 'delete' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.resource}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Maintenance Mode</p>
              <p className="text-sm text-gray-600">Temporary disable system for maintenance</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Auto Backup</p>
              <p className="text-sm text-gray-600">Automatic daily database backup</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-600">Send email for system alerts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="pt-4 border-t">
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
              Force Logout All Users
            </button>
            <p className="text-xs text-gray-500 mt-2">Immediately logout all users from system</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;