// Mock data untuk testing tanpa backend
export const mockData = {
  // Mock user data
  users: [
    {
      id: 1,
      username: 'admin',
      email: 'admin@desawisata.com',
      role: 'ADMIN',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      username: 'finance',
      email: 'finance@desawisata.com',
      role: 'FINANCE',
      isActive: true,
      createdAt: '2024-01-02T00:00:00Z'
    },
    {
      id: 3,
      username: 'staff',
      email: 'staff@desawisata.com',
      role: 'STAFF',
      isActive: true,
      createdAt: '2024-01-03T00:00:00Z'
    },
    {
      id: 4,
      username: 'receptionist',
      email: 'reception@desawisata.com',
      role: 'RECEPTIONIST',
      isActive: true,
      createdAt: '2024-01-04T00:00:00Z'
    }
  ],

  // Mock pengunjung data
  pengunjung: [
    {
      PengunjungID: 1,
      NamaLengkap: 'Budi Santoso',
      Email: 'budi@email.com',
      NomorHP: '081234567890',
      NegaraAsal: 'Indonesia',
      TanggalDaftar: '2024-01-01'
    },
    // ... tambahkan data dummy lainnya
  ],

  // Mock homestay data
  homestay: [
    {
      HE_ID: 1,
      Nama: 'Homestay Batik Laweyan',
      Lokasi: 'Solo, Jawa Tengah',
      JenisTiket: 'HE',
      KategoriKamar: 'Family',
      HargaPerMalam: 350000,
      HargaTiketEvent: 75000,
      KapasitasKamar: 10,
      KapasitasEvent: 50,
      Deskripsi: 'Penginapan budaya dengan workshop batik'
    },
    // ... tambahkan data dummy lainnya
  ],

  // Mock dashboard stats
  dashboardStats: {
    totalPengunjung: 1234,
    totalReservasi: 567,
    totalPendapatan: 456789000,
    activeReservasi: 89,
    monthlyRevenue: [
      { month: 'Jan', revenue: 45000000 },
      { month: 'Feb', revenue: 52000000 },
      { month: 'Mar', revenue: 48000000 },
      { month: 'Apr', revenue: 61000000 },
      { month: 'Mei', revenue: 59000000 },
      { month: 'Jun', revenue: 72000000 }
    ],
    byStatus: {
      labels: ['Booked', 'Confirmed', 'Cancelled', 'Completed'],
      data: [45, 30, 10, 15]
    }
  }
};

// Mock API functions untuk testing
export const mockApi = {
  get: async (endpoint) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    switch (endpoint) {
      case '/dashboard/stats':
        return { data: { data: mockData.dashboardStats } };
      case '/users':
        return { data: { data: mockData.users, pagination: { page: 1, total: 4, pages: 1 } } };
      case '/pengunjung':
        return { data: { data: mockData.pengunjung, pagination: { page: 1, total: 10, pages: 1 } } };
      case '/homestay':
        return { data: { data: mockData.homestay, pagination: { page: 1, total: 5, pages: 1 } } };
      default:
        return { data: {} };
    }
  },

  post: async (endpoint, data) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: { success: true, message: 'Operation successful' } };
  },

  put: async (endpoint, data) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: { success: true, message: 'Update successful' } };
  },

  delete: async (endpoint) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: { success: true, message: 'Delete successful' } };
  }
};