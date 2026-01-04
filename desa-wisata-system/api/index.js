require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../public')));
}

// Database connection untuk Vercel
const dbConfig = process.env.DATABASE_URL 
  ? {
      uri: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    }
  : {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306
    };

const pool = mysql.createPool(dbConfig);

// Middleware untuk RBAC
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token diperlukan' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
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
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({ token, user: { username: user.Username, role: user.Role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Dashboard Routes
app.get('/api/dashboard', authenticate, (req, res) => {
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
    console.error('Error fetching reservations:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint (tanpa auth)
app.get('/api/test', async (req, res) => {
  try {
    const [rows] = await pool.promise().execute('SELECT 1 as test');
    res.json({ 
      database: 'connected', 
      rows: rows,
      env: process.env.NODE_ENV 
    });
  } catch (error) {
    res.status(500).json({ 
      database: 'error', 
      error: error.message 
    });
  }
});

// Handle 404 untuk API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Serve frontend untuk semua routes lainnya
app.get('*', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  } else {
    res.status(404).send('Page not found');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server hanya jika tidak di Vercel
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;