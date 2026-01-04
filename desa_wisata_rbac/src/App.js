import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './Context/AuthContext';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PengunjungManagement from './components/Management/PengunjungManagement';
import HomestayManagement from './components/Management/HomestayManagement';
import ReservasiManagement from './components/Management/ReservasiManagement';
import PembayaranManagement from './components/Management/PembayaranManagement';
import UserManagement from './components/Management/UserManagement';
import LaporanKeuangan from './pages/LaporanKeuangan';
import AdminPanel from './pages/AdminPanel';
import Error403 from './pages/Error403';
import Profile from './pages/Profile';

import './styles/App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/error-403" element={<Error403 />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <div className="flex h-screen bg-gray-100">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Navbar />
                  <main className="flex-1 overflow-y-auto p-6">
                    <Routes>
                      <Route index element={<Navigate to="/dashboard" replace />} />
                      <Route path="dashboard" element={<Dashboard />} />
                      
                      {/* Management Routes */}
                      <Route path="pengunjung" element={
                        <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST']}>
                          <PengunjungManagement />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="homestay" element={
                        <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                          <HomestayManagement />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="reservasi" element={
                        <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST', 'STAFF']}>
                          <ReservasiManagement />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="pembayaran" element={
                        <ProtectedRoute allowedRoles={['ADMIN', 'FINANCE']}>
                          <PembayaranManagement />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="laporan-keuangan" element={
                        <ProtectedRoute allowedRoles={['ADMIN', 'FINANCE']}>
                          <LaporanKeuangan />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="users" element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                          <UserManagement />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="admin" element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                          <AdminPanel />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="profile" element={<Profile />} />
                      
                      {/* Catch all route */}
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;