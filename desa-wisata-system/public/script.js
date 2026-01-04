const API_URL = window.location.origin.includes('localhost') 
  ? 'http://localhost:3000/api' 
  : window.location.origin + '/api';

async function handleLogin(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    // Log response untuk debugging
    console.log('Login response:', response);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Login error:', errorText);
      alert(`Login gagal: ${errorText}`);
      return;
    }
    
    const data = await response.json();
    console.log('Login success:', data);
    
    // Simpan token
    localStorage.setItem('token', data.token);
    currentUser = data.user;
    
    showDashboard();
  } catch (error) {
    console.error('Network error:', error);
    alert('Error koneksi: ' + error.message);
  }
}

function showDashboard() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('dashboard-page').style.display = 'block';
    
    updateMenuBasedOnRole();
    loadDashboardData();
    
    // Tampilkan info user
    document.getElementById('current-user').textContent = 
        `${currentUser.username} (${currentUser.role})`;
}

function updateMenuBasedOnRole() {
    // Reset semua menu
    const menus = [
        'menu-reservations',
        'menu-pengunjung',
        'menu-events',
        'menu-payments',
        'menu-stats',
        'menu-stress-test'
    ];
    
    menus.forEach(menu => {
        document.getElementById(menu).style.display = 'none';
    });
    
    // Tampilkan menu berdasarkan role
    const role = currentUser.role;
    
    // Semua role bisa lihat reservasi
    document.getElementById('menu-reservations').style.display = 'block';
    
    if (role === 'admin') {
        menus.forEach(menu => document.getElementById(menu).style.display = 'block');
    } else if (role === 'finance') {
        document.getElementById('menu-payments').style.display = 'block';
        document.getElementById('menu-stats').style.display = 'block';
    } else if (role === 'staff') {
        document.getElementById('menu-events').style.display = 'block';
        document.getElementById('menu-stats').style.display = 'block';
    } else if (role === 'receptionist') {
        document.getElementById('menu-pengunjung').style.display = 'block';
        document.getElementById('menu-events').style.display = 'block';
    }
}

async function loadDashboardData() {
    try {
        const token = localStorage.getItem('token');
        
        // Contoh: Ambil data statistik
        const [reservasiRes, pengunjungRes, eventsRes] = await Promise.allSettled([
            fetch(`${API_URL}/reservations?limit=1`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch(`${API_URL}/pengunjung`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch(`${API_URL}/homestay-events`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);
        
        // Tampilkan jumlah data (dummy untuk contoh)
        document.getElementById('total-pengunjung').textContent = '500,000+';
        document.getElementById('total-reservasi').textContent = '500,000+';
        document.getElementById('total-homestay').textContent = '50';
        document.getElementById('total-pembayaran').textContent = '500,000+';
        
        // Tampilkan info role
        document.getElementById('role-info').innerHTML = `
            <h3>Hak Akses ${currentUser.role.toUpperCase()}:</h3>
            ${getRolePermissions(currentUser.role).map(perm => 
                `<div class="permission-item">✓ ${perm}</div>`
            ).join('')}
        `;
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function getRolePermissions(role) {
    const permissions = {
        admin: [
            'Akses penuh ke semua fitur',
            'Manajemen user dan role',
            'Lihat semua data tanpa batas',
            'Monitoring query performance',
            'Stress test database'
        ],
        finance: [
            'Lihat data pembayaran',
            'Lihat data reservasi',
            'Monitoring query performance',
            'Tidak bisa edit data pengunjung/event'
        ],
        staff: [
            'Manajemen homestay & event',
            'Lihat data reservasi',
            'Monitoring query performance',
            'Tidak bisa akses data pembayaran'
        ],
        receptionist: [
            'Manajemen data pengunjung',
            'Manajemen reservasi',
            'Lihat data homestay & event',
            'Tidak bisa akses data pembayaran'
        ]
    };
    return permissions[role] || [];
}

async function loadReservations(page = 1) {
    try {
        currentPage = page;
        const search = document.getElementById('search-reservasi').value;
        const token = localStorage.getItem('token');
        
        const response = await fetch(
            `${API_URL}/reservations?page=${page}&limit=${currentLimit}&search=${encodeURIComponent(search)}`,
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );
        
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error);
        
        // Render tabel
        const tbody = document.querySelector('#reservasi-table tbody');
        tbody.innerHTML = data.data.map(reservasi => `
            <tr>
                <td>${reservasi.ReservasiID}</td>
                <td>${reservasi.NamaLengkap}</td>
                <td>${reservasi.Nama}</td>
                <td>${new Date(reservasi.TanggalMulai).toLocaleDateString('id-ID')}</td>
                <td>${new Date(reservasi.TanggalSelesai).toLocaleDateString('id-ID')}</td>
                <td>Rp ${reservasi.TotalHarga.toLocaleString('id-ID')}</td>
                <td><span class="status-badge ${reservasi.Status}">${reservasi.Status}</span></td>
            </tr>
        `).join('');
        
        // Render pagination
        renderPagination(data.totalPages, page);
        
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

function renderPagination(totalPages, currentPage) {
    const pagination = document.getElementById('pagination');
    let html = '';
    
    if (currentPage > 1) {
        html += `<button onclick="loadReservations(${currentPage - 1})">Prev</button>`;
    }
    
    // Tampilkan beberapa halaman sekitar current page
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
        html += `<button class="${i === currentPage ? 'active' : ''}" 
                  onclick="loadReservations(${i})">${i}</button>`;
    }
    
    if (currentPage < totalPages) {
        html += `<button onclick="loadReservations(${currentPage + 1})">Next</button>`;
    }
    
    html += `<span>Total: ${totalPages} halaman</span>`;
    pagination.innerHTML = html;
}

function showReservations() {
    hideAllContents();
    document.getElementById('reservasi-content').style.display = 'block';
    loadReservations();
}

function showPengunjung() {
    hideAllContents();
    document.getElementById('pengunjung-content').style.display = 'block';
    loadPengunjung();
}

async function loadPengunjung() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/pengunjung`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error);
        
        const tbody = document.querySelector('#pengunjung-table tbody');
        tbody.innerHTML = data.map(p => `
            <tr>
                <td>${p.PengunjungID}</td>
                <td>${p.NamaLengkap}</td>
                <td>${p.NegaraAsal}</td>
                <td>${p.Email}</td>
                <td>${p.NomorHP}</td>
                <td>${new Date(p.TanggalDaftar).toLocaleDateString('id-ID')}</td>
            </tr>
        `).join('');
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function showEvents() {
    hideAllContents();
    document.getElementById('events-content').style.display = 'block';
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/homestay-events`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        const tbody = document.querySelector('#events-table tbody');
        tbody.innerHTML = data.map(event => `
            <tr>
                <td>${event.Nama}</td>
                <td>${event.Lokasi}</td>
                <td>${event.JenisTiket}</td>
                <td>${event.KategoriKamar || '-'}</td>
                <td>Rp ${event.HargaPerMalam.toLocaleString('id-ID')}</td>
                <td>Rp ${event.HargaTiketEvent.toLocaleString('id-ID')}</td>
            </tr>
        `).join('');
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function showPayments() {
    hideAllContents();
    document.getElementById('payments-content').style.display = 'block';
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/payments`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        const tbody = document.querySelector('#payments-table tbody');
        tbody.innerHTML = data.map(payment => `
            <tr>
                <td>${payment.PembayaranID}</td>
                <td>${payment.ReservasiID}</td>
                <td>${new Date(payment.TanggalBayar).toLocaleString('id-ID')}</td>
                <td>Rp ${payment.JumlahBayar.toLocaleString('id-ID')}</td>
                <td>${payment.MetodePembayaran}</td>
                <td>${payment.StatusPembayaran}</td>
            </tr>
        `).join('');
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function showStats() {
    hideAllContents();
    document.getElementById('stats-content').style.display = 'block';
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/query-stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        document.getElementById('stats-container').innerHTML = 
            JSON.stringify(data, null, 2);
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function runStressTest() {
    if (!confirm('Ini akan memuat SEMUA data reservasi (500k+ records). Lanjutkan?')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const startTime = Date.now();
        
        document.getElementById('stress-test-result').innerHTML = 
            '<div class="loading">Memuat data... Ini mungkin butuh waktu lama ⏳</div>';
        
        const response = await fetch(`${API_URL}/admin/all-reservations`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        
        if (!response.ok) {
            throw new Error(data.error || 'Akses ditolak');
        }
        
        document.getElementById('stress-test-result').innerHTML = `
            <div class="result-card">
                <h3>✅ Stress Test Selesai!</h3>
                <p><strong>Waktu Eksekusi:</strong> ${duration.toFixed(2)} detik</p>
                <p><strong>Jumlah Record:</strong> ${data.length.toLocaleString('id-ID')} reservasi</p>
                <p><strong>Memory Usage:</strong> ~${(JSON.stringify(data).length / 1024 / 1024).toFixed(2)} MB</p>
                <p class="note">⚠️ Note: Dengan pagination (10 records/halaman), query ini akan jauh lebih cepat!</p>
            </div>
        `;
        
    } catch (error) {
        document.getElementById('stress-test-result').innerHTML = `
            <div class="error-card">
                <h3>❌ Error: ${error.message}</h3>
                <p>Stress test hanya bisa diakses oleh Admin</p>
            </div>
        `;
    }
}

function showStressTest() {
    hideAllContents();
    document.getElementById('stress-test-content').style.display = 'block';
}

function hideAllContents() {
    const contents = [
        'dashboard-content',
        'reservasi-content',
        'pengunjung-content',
        'events-content',
        'payments-content',
        'stats-content',
        'stress-test-content'
    ];
    
    contents.forEach(id => {
        document.getElementById(id).style.display = 'none';
    });
}

function logout() {
    localStorage.removeItem('token');
    currentUser = null;
    document.getElementById('dashboard-page').style.display = 'none';
    document.getElementById('login-page').style.display = 'flex';
}