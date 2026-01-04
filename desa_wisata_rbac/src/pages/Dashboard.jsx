import React from 'react';
import { useAuth } from '../Context/AuthContext';
import AdminDashboard from '../components/Dashboard/AdminDashboard';
import FinanceDashboard from '../components/Dashboard/FinanceDashboard';
import StaffDashboard from '../components/Dashboard/StaffDashboard';
import ReceptionistDashboard from '../components/Dashboard/ReceptionistDashboard';
import Error403 from './Error403';

const Dashboard = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case 'ADMIN':
        return <AdminDashboard />;
      case 'FINANCE':
        return <FinanceDashboard />;
      case 'STAFF':
        return <StaffDashboard />;
      case 'RECEPTIONIST':
        return <ReceptionistDashboard />;
      default:
        return <Error403 />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Selamat datang kembali, {user?.username}! Berikut ringkasan sistem.
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>
      
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;