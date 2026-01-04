import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { BuildingOfficeIcon, CalendarIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const StaffDashboard = () => {
  const [homestayStats, setHomestayStats] = useState({
    totalHomestay: 0,
    availableRooms: 0,
    totalEvents: 0,
    upcomingEvents: 0
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    try {
      const [statsRes, eventsRes] = await Promise.all([
        api.get('/homestay/stats'),
        api.get('/homestay/upcoming-events')
      ]);

      setHomestayStats(statsRes.data);
      setUpcomingEvents(eventsRes.data);
    } catch (error) {
      console.error('Error fetching staff data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
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
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <BuildingOfficeIcon className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Staff Homestay & Event</h1>
            <p className="text-gray-600">Kelola homestay dan event wisata</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
            <div className="flex items-center">
              <BuildingOfficeIcon className="h-10 w-10 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">Total Homestay</p>
                <p className="text-2xl font-bold text-gray-900">{homestayStats.totalHomestay}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
            <div className="flex items-center">
              <BuildingOfficeIcon className="h-10 w-10 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">Kamar Tersedia</p>
                <p className="text-2xl font-bold text-gray-900">{homestayStats.availableRooms}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
            <div className="flex items-center">
              <CalendarIcon className="h-10 w-10 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-600">Total Event</p>
                <p className="text-2xl font-bold text-gray-900">{homestayStats.totalEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6">
            <div className="flex items-center">
              <CalendarIcon className="h-10 w-10 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-yellow-600">Event Mendatang</p>
                <p className="text-2xl font-bold text-gray-900">{homestayStats.upcomingEvents}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Mendatang</h3>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.HE_ID} className="bg-white rounded-lg border p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{event.Nama}</h4>
                    <p className="text-sm text-gray-600 mt-1">{event.Lokasi}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-sm text-gray-500">
                        Kapasitas: {event.KapasitasEvent} orang
                      </span>
                      <span className="text-sm text-gray-500">
                        Tiket: Rp {event.HargaTiketEvent.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {event.JenisTiket}
                  </span>
                </div>
                {event.Deskripsi && (
                  <p className="text-sm text-gray-600 mt-3">{event.Deskripsi.substring(0, 100)}...</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <button className="bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition">
          <div className="text-blue-600 font-semibold text-lg">Tambah Homestay Baru</div>
          <div className="text-gray-600 mt-2">Registrasi properti baru</div>
        </button>
        
        <button className="bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition">
          <div className="text-green-600 font-semibold text-lg">Jadwal Event</div>
          <div className="text-gray-600 mt-2">Lihat kalender event</div>
        </button>
        
        <button className="bg-white rounded-lg shadow p-6 text-center hover:shadow-lg transition">
          <div className="text-purple-600 font-semibold text-lg">Update Ketersediaan</div>
          <div className="text-gray-600 mt-2">Status kamar homestay</div>
        </button>
      </div>
    </div>
  );
};

export default StaffDashboard;