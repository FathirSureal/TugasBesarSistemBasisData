export const ROLE_PERMISSIONS = {
  ADMIN: {
    name: 'Administrator',
    description: 'Akses penuh ke semua fitur sistem',
    color: 'bg-red-100 text-red-800',
    permissions: [
      'users:manage',
      'pengunjung:read', 'pengunjung:create', 'pengunjung:update', 'pengunjung:delete',
      'homestay:read', 'homestay:create', 'homestay:update', 'homestay:delete',
      'reservasi:read', 'reservasi:create', 'reservasi:update', 'reservasi:delete',
      'pembayaran:read', 'pembayaran:create', 'pembayaran:update', 'pembayaran:delete',
      'laporan:generate', 'dashboard:view', 'settings:manage'
    ]
  },
  FINANCE: {
    name: 'Keuangan',
    description: 'Mengelola pembayaran dan laporan keuangan',
    color: 'bg-green-100 text-green-800',
    permissions: [
      'pembayaran:read', 'pembayaran:create', 'pembayaran:update',
      'reservasi:read',
      'laporan:generate', 'dashboard:view'
    ]
  },
  STAFF: {
    name: 'Staff',
    description: 'Mengelola homestay dan event',
    color: 'bg-blue-100 text-blue-800',
    permissions: [
      'homestay:read', 'homestay:create', 'homestay:update', 'homestay:delete',
      'reservasi:read',
      'dashboard:view'
    ]
  },
  RECEPTIONIST: {
    name: 'Resepsionis',
    description: 'Mengelola pengunjung dan reservasi',
    color: 'bg-purple-100 text-purple-800',
    permissions: [
      'pengunjung:read', 'pengunjung:create', 'pengunjung:delete',
      'reservasi:read', 'reservasi:create', 'reservasi:delete',
      'homestay:read',
      'dashboard:view'
    ]
  }
};

export const hasPermission = (user, permission) => {
  if (!user) return false;
  
  const role = ROLE_PERMISSIONS[user.role];
  if (!role) return false;
  
  return role.permissions.includes('*') || role.permissions.includes(permission);
};

export const getRoleInfo = (role) => {
  return ROLE_PERMISSIONS[role] || { name: role, color: 'bg-gray-100 text-gray-800' };
};