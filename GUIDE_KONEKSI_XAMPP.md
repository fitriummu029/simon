# 🚀 Panduan Menghubungkan SiMon-S dengan XAMPP (MySQL)

SiMon-S saat ini dikonfigurasi untuk menggunakan database `db.json` agar mudah dijalankan tanpa perlu instalasi basis data apa pun di sisi *browser preview*. 

Namun, jika Anda ingin menghubungkannya ke **XAMPP (MySQL)** di komputer lokal (localhost) Anda saat mendevelop secara langsung, ikuti langkah-langkah di bawah ini:

---

## 📅 Langkah 1: Siapkan MySQL di XAMPP
1. Buka **XAMPP Control Panel**.
2. Klik tombol **Start** pada modul **Apache** dan **MySQL**.
3. Buka browser Anda dan akses: `http://localhost/phpmyadmin/`
4. Buat basis data (database) baru dengan nama, contoh: `simons_db`.
5. Anda bisa mengimpor tabel-tabel atau membiarkan Node.js yang membuat strukturnya.

---

## 🛠️ Langkah 2: Instal Library MySQL di Node.js
Di folder root proyek SiMon-S pada terminal komputer Anda, instal driver MySQL untuk Node.js:
```bash
npm install mysql2
```

---

## 🗄️ Langkah 3: Buat Koneksi Database di Server Node.js
Anda perlu memodifikasi kode database di file `server.ts`. 

### A. Contoh Skema Tabel MySQL
Berikut adalah query SQL untuk membuat tabel-tabel di phpMyAdmin sesuai data `db.json`:

```sql
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  role ENUM('mahasiswa', 'dosen', 'admin') NOT NULL
);

CREATE TABLE dosens (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50),
  nidn VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE mahasiswas (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50),
  nim VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  judul_skripsi VARCHAR(255) NOT NULL,
  dosen_id VARCHAR(50),
  tanggal_sidang VARCHAR(100),
  tempat_sidang VARCHAR(100),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (dosen_id) REFERENCES dosens(id) ON DELETE SET NULL
);

CREATE TABLE bimbingans (
  id VARCHAR(50) PRIMARY KEY,
  mahasiswa_id VARCHAR(50),
  dosen_id VARCHAR(50),
  bab INT NOT NULL,
  file_name VARCHAR(150) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_size VARCHAR(50),
  catatan_mahasiswa TEXT,
  komentar TEXT,
  status ENUM('pending', 'perlu_revisi', 'disetujui') DEFAULT 'pending',
  version INT NOT NULL,
  created_at VARCHAR(100) NOT NULL,
  FOREIGN KEY (mahasiswa_id) REFERENCES mahasiswas(id) ON DELETE CASCADE,
  FOREIGN KEY (dosen_id) REFERENCES dosens(id) ON DELETE CASCADE
);
```

### B. Menghubungkan Backend ke MySQL di `server.ts`
Ubah bagian pembacaan berkas pada `server.ts` dengan menggunakan modul `mysql2`. Berikut adalah rancangan kode koneksi yang dapat Anda pakai:

```typescript
import mysql from 'mysql2/promise';

// Setup Connection Pool ke XAMPP MySQL
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',      // Default user XAMPP
  password: '',      // Default password XAMPP kosong
  database: 'simons_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Contoh implementasi modul autentikasi menggunakan database MySQL:
app.post("/api/login", async (req, res) => {
  const { email, password, role } = req.body;
  const searchString = email.trim().toLowerCase();

  try {
    // Mencari user berdasarkan Email atau Nama
    const [rows]: any = await pool.execute(
      "SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(name) = ?",
      [searchString, searchString]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Pengguna tidak ditemukan." });
    }

    const user = rows[0];

    if (user.password !== password) {
      return res.status(401).json({ error: "Kata sandi salah." });
    }

    // Ambil info relasional mahasiswa / dosen tambahan
    let mahasiswaInfo = null;
    let dosenInfo = null;

    if (user.role === "mahasiswa") {
      const [mhsRows]: any = await pool.execute("SELECT * FROM mahasiswas WHERE user_id = ?", [user.id]);
      mahasiswaInfo = mhsRows[0] || null;
    } else if (user.role === "dosen") {
      const [dsnRows]: any = await pool.execute("SELECT * FROM dosens WHERE user_id = ?", [user.id]);
      dosenInfo = dsnRows[0] || null;
    }

    res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      mahasiswaInfo,
      dosenInfo
    });
  } catch (error) {
    res.status(500).json({ error: "Database error: " + error.message });
  }
});
```

Dengan beralih dari penyimpanan file `db.json` ke MySQL pool koneksi seperti di atas, aplikasi SiMon-S Anda akan seutuhnya ditenagai oleh database lokal XAMPP yang tangguh dan siap pakai untuk uji skripsi di depan dosen penguji!
