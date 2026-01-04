import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { CalendarIcon, UserPlusIcon } from '@heroicons/react/24/outline';

const ReceptionistDashboard = () => {
  const [todayReservasi, setTodayReservasi] = useState([]);
  const [recentPengunjung, setRecentPengunjung] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceptionistData();
  }, []);

  const fetchReceptionistData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [reservasiRes, pengunjungRes] = await Promise.all([
        api.get(`/reservasi?tanggal=${today}&status=Booked`),
        api.get('/pengunjung?limit=5&order=desc')
      ]);

      setTodayReservasi(reservasiRes.data.data);
      setRecentPengunjung(pengunjungRes.data.data);
    } catch (error) {
      console.error('Error fetching receptionist data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
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
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Dashboard Resepsionis</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Tambah Pengunjung
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Today's Reservations */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-4">
              <CalendarIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Reservasi Hari Ini</h3>
              <span className="ml-auto bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                {todayReservasi.length} Reservasi
              </span>
            </div>
            
            <div className="space-y-3">
              {todayReservasi.slice(0, 5).map((reservasi) => (
                <div key={reservasi.ReservasiID} className="bg-white p-3 rounded border">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{reservasi.pengunjung?.NamaLengkap}</p>
                      <p className="text-sm text-gray-600">{reservasi.homestayEvent?.Nama}</p>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                      {reservasi.Status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(reservasi.TanggalMulai)} - {formatDate(reservasi.TanggalSelesai)}
                  </p>
                </div>
              ))}
              
              {todayReservasi.length === 0 && (
                <p className="text-gray-500 text-center py-4">Tidak ada reservasi hari ini</p>
              )}
            </div>
          </div>

          {/* Recent Pengunjung */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pengunjung Terbaru</h3>
            
            <div className="space-y-3">
              {recentPengunjung.map((pengunjung) => (
                <div key={pengunjung.PengunjungID} className="bg-white p-3 rounded border">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">
                        {pengunjung.NamaLengkap.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">{pengunjung.NamaLengkap}</p>
                      <p className="text-sm text-gray-600">{pengunjung.Email}</p>
                      <p className="text-xs text-gray-500">
                        {pengunjung.NegaraAsal || 'Belum diisi'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-white border border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50">
            <div className="text-blue-600 font-semibold">Cek Kamar</div>
            <div className="text-sm text-gray-600 mt-1">Ketersediaan</div>
          </button>
          
          <button className="bg-white border border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50">
            <div className="text-green-600 font-semibold">Buat Reservasi</div>
            <div className="text-sm text-gray-600 mt-1">Manual</div>
          </button>
          
          <button className="bg-white border border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50">
            <div className="text-purple-600 font-semibold">Cetak Invoice</div>
            <div className="text-sm text-gray-600 mt-1">Pembayaran</div>
          </button>
          
          <button className="bg-white border border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50">
            <div className="text-yellow-600 font-semibold">Laporan Harian</div>
            <div className="text-sm text-gray-600 mt-1">Ringkasan</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;