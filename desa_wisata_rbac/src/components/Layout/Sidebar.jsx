import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import {
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CreditCardIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const { user, hasPermission } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: HomeIcon,
      permission: 'dashboard:view'
    },
    {
      path: '/pengunjung',
      name: 'Pengunjung',
      icon: UsersIcon,
      permission: 'pengunjung:read',
      roles: ['ADMIN', 'RECEPTIONIST']
    },
    {
      path: '/homestay',
      name: 'Homestay & Event',
      icon: BuildingOfficeIcon,
      permission: 'homestay:read',
      roles: ['ADMIN', 'STAFF']
    },
    {
      path: '/reservasi',
      name: 'Reservasi',
      icon: CalendarIcon,
      permission: 'reservasi:read',
      roles: ['ADMIN', 'RECEPTIONIST', 'STAFF']
    },
    {
      path: '/pembayaran',
      name: 'Pembayaran',
      icon: CreditCardIcon,
      permission: 'pembayaran:read',
      roles: ['ADMIN', 'FINANCE']
    },
    {
      path: '/laporan-keuangan',
      name: 'Laporan Keuangan',
      icon: ChartBarIcon,
      permission: 'laporan:generate',
      roles: ['ADMIN', 'FINANCE']
    },
    {
      path: '/users',
      name: 'User Management',
      icon: UserGroupIcon,
      permission: 'users:manage',
      roles: ['ADMIN']
    },
    {
      path: '/admin',
      name: 'Admin Panel',
      icon: Cog6ToothIcon,
      permission: 'settings:manage',
      roles: ['ADMIN']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    hasPermission(user, item.permission)
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white"
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      {/* Sidebar */}
      <aside className={`
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 transform fixed lg:static 
        inset-y-0 left-0 z-40 w-64 bg-gray-900 
        transition-transform duration-300 ease-in-out
        overflow-y-auto
      `}>
        <div className="flex items-center justify-center h-16 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Menu</h2>
        </div>
        
        <nav className="mt-5 px-2">
          {filteredMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `group flex items-center px-2 py-3 text-sm font-medium rounded-md mb-1
                ${isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
          <div className="flex items-center">
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user?.username}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;