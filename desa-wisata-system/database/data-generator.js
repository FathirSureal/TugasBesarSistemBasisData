const mysql = require('mysql2/promise');
const faker = require('faker/locale/id_ID');

const config = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'desa_wisata'
};

async function generateData() {
    const connection = await mysql.createConnection(config);
    
    console.log('Starting data generation...');
    
    try {
        // Generate 500,000 pengunjung
        console.log('Generating 500,000 pengunjung...');
        for (let i = 0; i < 500000; i += 1000) {
            const values = [];
            for (let j = 0; j < 1000; j++) {
                values.push([
                    faker.name.findName(),
                    faker.address.country(),
                    faker.internet.email(),
                    faker.phone.phoneNumber(),
                    faker.date.past(2)
                ]);
            }
            
            await connection.query(
                'INSERT INTO Pengunjung (NamaLengkap, NegaraAsal, Email, NomorHP, TanggalDaftar) VALUES ?',
                [values]
            );
            
            if (i % 50000 === 0) console.log(`Generated ${i} pengunjung`);
        }
        
        // Generate 500,000 reservasi
        console.log('Generating 500,000 reservasi...');
        const [pengunjungIds] = await connection.query('SELECT PengunjungID FROM Pengunjung');
        const [heIds] = await connection.query('SELECT HE_ID FROM HomestayEvent');
        
        for (let i = 0; i < 500000; i += 1000) {
            const values = [];
            for (let j = 0; j < 1000; j++) {
                const pengunjungId = pengunjungIds[Math.floor(Math.random() * pengunjungIds.length)].PengunjungID;
                const heId = heIds[Math.floor(Math.random() * heIds.length)].HE_ID;
                const startDate = faker.date.between('2020-01-01', '2024-12-31');
                const days = Math.floor(Math.random() * 10) + 1;
                
                values.push([
                    pengunjungId,
                    heId,
                    startDate,
                    new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000),
                    days,
                    Math.floor(Math.random() * 5) + 1,
                    0, // akan diisi trigger
                    ['Booked', 'Confirmed', 'Cancelled'][Math.floor(Math.random() * 3)],
                    faker.date.past(1)
                ]);
            }
            
            await connection.query(
                `INSERT INTO Reservasi 
                (PengunjungID, HE_ID, TanggalMulai, TanggalSelesai, JumlahHari, JumlahPeserta, TotalHarga, Status, TanggalBuat) 
                VALUES ?`,
                [values]
            );
            
            if (i % 50000 === 0) console.log(`Generated ${i} reservasi`);
        }
        
        // Generate 500,000 pembayaran
        console.log('Generating 500,000 pembayaran...');
        const [reservasiIds] = await connection.query('SELECT ReservasiID FROM Reservasi');
        
        for (let i = 0; i < 500000; i += 1000) {
            const values = [];
            for (let j = 0; j < 1000; j++) {
                const reservasiId = reservasiIds[Math.floor(Math.random() * reservasiIds.length)].ReservasiID;
                
                values.push([
                    reservasiId,
                    faker.date.recent(30),
                    0, // akan diisi trigger
                    ['QRIS', 'Bank Transfer', 'Credit Card', 'Cash'][Math.floor(Math.random() * 4)],
                    ['Lunas', 'Pending', 'Failed'][Math.floor(Math.random() * 3)],
                    faker.lorem.sentence()
                ]);
            }
            
            await connection.query(
                `INSERT INTO DetailPembayaran 
                (ReservasiID, TanggalBayar, JumlahBayar, MetodePembayaran, StatusPembayaran, Keterangan) 
                VALUES ?`,
                [values]
            );
            
            if (i % 50000 === 0) console.log(`Generated ${i} pembayaran`);
        }
        
        // Generate 500,000 history
        console.log('Generating 500,000 history...');
        for (let i = 0; i < 500000; i += 1000) {
            const values = [];
            for (let j = 0; j < 1000; j++) {
                const reservasiId = reservasiIds[Math.floor(Math.random() * reservasiIds.length)].ReservasiID;
                
                values.push([
                    reservasiId,
                    ['Booked', 'Confirmed'][Math.floor(Math.random() * 2)],
                    ['Confirmed', 'Cancelled', 'Completed'][Math.floor(Math.random() * 3)],
                    faker.date.recent(10),
                    faker.lorem.sentence()
                ]);
            }
            
            await connection.query(
                `INSERT INTO HistoryReservasi 
                (ReservasiID, StatusLama, StatusBaru, TanggalPerubahan, Keterangan) 
                VALUES ?`,
                [values]
            );
            
            if (i % 50000 === 0) console.log(`Generated ${i} history`);
        }
        
        console.log('Data generation completed successfully!');
        
        // Verifikasi jumlah data
        const tables = ['Pengunjung', 'Reservasi', 'DetailPembayaran', 'HistoryReservasi'];
        for (const table of tables) {
            const [result] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
            console.log(`${table}: ${result[0].count} records`);
        }
        
    } catch (error) {
        console.error('Error generating data:', error);
    } finally {
        await connection.end();
    }
}

generateData();