require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware untuk RBAC
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token diperlukan' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token tidak valid' });
  }
};

const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Akses ditolak' });
    }
    next();
  };
};

// Tabel Users untuk RBAC
const createUsersTable = `
  CREATE TABLE IF NOT EXISTS Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Role ENUM('admin', 'finance', 'staff', 'receptionist') NOT NULL DEFAULT 'staff',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

// Setup awal database
pool.query(createUsersTable, (err) => {
  if (err) console.error('Error creating users table:', err);
  else console.log('Users table ready');
  
  // Insert default admin user jika belum ada
  const defaultPassword = bcrypt.hashSync('admin123', 10);
  const insertAdmin = `
    INSERT IGNORE INTO Users (Username, Password, Email, Role) 
    VALUES ('admin', ?, 'admin@desawisata.com', 'admin')
  `;
  pool.execute(insertAdmin, [defaultPassword]);
});

// Authentication Routes
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const [rows] = await pool.promise().execute(
      'SELECT * FROM Users WHERE Username = ?',
      [username]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }
    
    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.Password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }
    
    const token = jwt.sign(
      { userId: user.UserID, username: user.Username, role: user.Role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ token, user: { username: user.Username, role: user.Role } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Dashboard Routes dengan RBAC
app.get('/api/dashboard', authenticate, (req, res) => {
  // Berikan data berdasarkan role
  const role = req.user.role;
  let data = { message: `Welcome ${req.user.username}`, role };
  
  if (role === 'admin') {
    data.access = ['all'];
  } else if (role === 'finance') {
    data.access = ['view_payments', 'view_reservations'];
  } else if (role === 'staff') {
    data.access = ['manage_events', 'view_reservations'];
  } else if (role === 'receptionist') {
    data.access = ['manage_visitors', 'manage_reservations'];
  }
  
  res.json(data);
});

// Reservasi Routes dengan pagination
app.get('/api/reservations', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    
    let query = `
      SELECT r.*, p.NamaLengkap, he.Nama 
      FROM Reservasi r
      JOIN Pengunjung p ON r.PengunjungID = p.PengunjungID
      JOIN HomestayEvent he ON r.HE_ID = he.HE_ID
      WHERE p.NamaLengkap LIKE ?
      LIMIT ? OFFSET ?
    `;
    
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM Reservasi r
      JOIN Pengunjung p ON r.PengunjungID = p.PengunjungID
      WHERE p.NamaLengkap LIKE ?
    `;
    
    const [rows] = await pool.promise().execute(query, [`%${search}%`, limit, offset]);
    const [countRows] = await pool.promise().execute(countQuery, [`%${search}%`]);
    
    res.json({
      data: rows,
      total: countRows[0].total,
      page,
      totalPages: Math.ceil(countRows[0].total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pengunjung Routes
app.get('/api/pengunjung', authenticate, authorize(['admin', 'receptionist']), async (req, res) => {
  try {
    const [rows] = await pool.promise().execute(
      'SELECT * FROM Pengunjung ORDER BY TanggalDaftar DESC LIMIT 100'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Homestay Event Routes
app.get('/api/homestay-events', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.promise().execute(
      'SELECT * FROM HomestayEvent ORDER BY Nama'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pembayaran Routes - hanya finance
app.get('/api/payments', authenticate, authorize(['admin', 'finance']), async (req, res) => {
  try {
    const [rows] = await pool.promise().execute(
      'SELECT * FROM DetailPembayaran ORDER BY TanggalBayar DESC LIMIT 50'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route khusus admin untuk semua data tanpa pagination (stress test)
app.get('/api/admin/all-reservations', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const [rows] = await pool.promise().execute(`
      SELECT r.*, p.NamaLengkap, he.Nama 
      FROM Reservasi r
      JOIN Pengunjung p ON r.PengunjungID = p.PengunjungID
      JOIN HomestayEvent he ON r.HE_ID = he.HE_ID
      ORDER BY r.TanggalBuat DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Optimasi query monitoring
app.get('/api/query-stats', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const queries = [
      'EXPLAIN SELECT * FROM Reservasi WHERE ReservasiID > 70000 AND PengunjungID < 500000 AND HE_ID > 30',
      'EXPLAIN SELECT * FROM DetailPembayaran WHERE MetodePembayaran = "QRIS"',
      'SHOW INDEX FROM Reservasi',
      'SHOW INDEX FROM DetailPembayaran'
    ];
    
    const results = {};
    for (const query of queries) {
      const [rows] = await pool.promise().execute(query);
      results[query.substring(0, 50) + '...'] = rows;
    }
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});