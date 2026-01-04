import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';

const Error403 = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <ShieldExclamationIcon className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">403</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Akses Ditolak</h2>
          <p className="text-gray-600 mb-6">
            Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.
            <br />
            Silakan hubungi administrator jika Anda memerlukan akses.
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition"
          >
            Kembali ke Halaman Sebelumnya
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Kembali ke Dashboard
          </button>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>
            Sistem menggunakan Role-Based Access Control (RBAC) untuk mengatur hak akses.
            Setiap role memiliki izin yang berbeda-beda.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Error403;