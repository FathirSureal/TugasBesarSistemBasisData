# Sistem Manajemen Desa Wisata dengan RBAC

Sistem web untuk mengelola desa wisata dengan Role-Based Access Control (RBAC)

## 🚀 Fitur Utama

- **RBAC (Role-Based Access Control)**: 4 role dengan izin berbeda
- **Manajemen Pengunjung**: CRUD data pengunjung
- **Manajemen Homestay & Event**: Kelola homestay dan event wisata
- **Manajemen Reservasi**: Buat, lihat, dan kelola reservasi
- **Manajemen Pembayaran**: Kelola transaksi pembayaran
- **Dashboard Berdasarkan Role**: Setiap role memiliki dashboard berbeda
- **Optimasi SQL**: Query yang dioptimalkan dengan indeks
- **Responsive Design**: Mobile-friendly dengan Tailwind CSS

## 👥 Roles & Permissions

| Role | Hak Akses | Deskripsi |
|------|-----------|-----------|
| Admin | Full Access | Mengelola semua data dan pengguna |
| Finance | Pembayaran & Laporan | Mengelola pembayaran dan laporan keuangan |
| Staff | Homestay & Event | Mengelola homestay dan event wisata |
| Receptionist | Pengunjung & Reservasi | Mengelola data pengunjung dan reservasi |

## 📦 Instalasi

### Prerequisites
- Node.js 16+
- MySQL 8+
- Git

### Backend Setup
```bash
# Clone repository
git clone <repository-url>
cd desa-wisata-system

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env file dengan konfigurasi database

# Setup database
npx prisma db push
npm run seed

# Start server
npm run dev