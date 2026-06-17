# SiMon-S: Sistem Monitoring Progress Skripsi & Kerja Praktek

SiMon-S (Sistem Monitoring Progress Skripsi & Kerja Praktek) adalah aplikasi manajemen akademik full-stack yang dirancang untuk mendigitalisasi, memantau, dan menyederhanakan alur bimbingan skripsi / tugas akhir antara Mahasiswa, Dosen Pembimbing, dan Admin / Kaprodi.

## 🚀 Fitur Utama System

1. **Role-Based Access Control (RBAC):**
   - **Mahasiswa:** Melihat grafik kelulusan per bab, mengunggah draf revisi dengan kontrol versi otomatis (v1, v2, dst), meninjau rincian umpan balik dari dosen pembimbing, dan menavigasi logbook riwayat secara komprehensif.
   - **Dosen Pembimbing:** Mengelola daftar mahasiswa bimbingan aktif, mengunduh draf bab terbaru, memberikan catatan persetujuan ("Setujui") atau revisi ("Minta Revisi Lagi"), serta menjadwalkan sidang ujian skripsi terintegrasi.
   - **Admin / Kaprodi:** Memantau keseluruhan papan statistik kemajuan mahasiswa, melakukan manajemen CRUD lengkap pada dosen dan mahasiswa, menyetel ulang kata sandi pengguna, serta memantau log aktivitas sistem audit dan pemberitahuan email keluar secara real-time.

2. **Durable File Upload Core:**
   - Mendukung pengunggahan berkas nyata (.pdf / .docx) hingga ukuran maksimal **10MB** dengan validasi tipe berkas aman dan ekstraksi penyimpanan dinamis di `/uploads/`.

3. **Email Notification Engine (Simulated):**
   - Pemicu otomatis surat elektronik virtual yang dikirim saat mahasiswa melakukan submisi berkas bimbingan baru, saat dosen melakukan persetujuan/koleksi bimbingan, maupun saat jadwal ujian sidang disinkronkan. Semua outbox email terekam dalam papan kaprodi dan dapat memicu pop-up visual real-time di layar.

---

## 🗄️ Desain & Struktur Database (JSON Store Schema)

Sistem menggunakan penyimpanan berbasis file `db.json` yang menjamin kestabilan, performansi cepat, serta durabilitas data antar sesi. Berikut adalah model skema relasi data minimal yang diimplementasikan:

```ts
// 1. users
interface User {
  id: string;        // ID Unik Pengguna
  name: string;      // Nama Lengkap beserta Gelar
  email: string;     // Alamat Email Utama (digunakan untuk Login)
  password?: string; // Kata Sandi akun terenkripsi lokal
  role: 'mahasiswa' | 'dosen' | 'admin';
}

// 2. mahasiswas
interface Mahasiswa {
  id: string;            // ID Mahasiswa
  user_id: string;        // Referensi relasional user.id
  nim: string;            // Nomor Induk Mahasiswa
  name: string;           // Nama Lengkap
  judul_skripsi: string;  // Judul Laporan Skripsi / KP Utama
  dosen_id: string;       // Referensi relasional dosen.id (Pembimbing)
}

// 3. dosens
interface Dosen {
  id: string;      // ID Dosen Pembimbing
  user_id: string;  // Referensi relasional user.id
  nidn: string;     // Nomor Induk Dosen Nasional
  name: string;     // Nama Lengkap
}

// 4. bimbingans
interface Bimbingan {
  id: string;                 // ID Catatan Bimbingan / Pengajuan berkas
  mahasiswa_id: string;       // Referensi relasional mahasiswa.id
  dosen_id: string;           // Referensi relasional dosen.id
  bab: number;                // Nomor Bab (1 s.d 7)
  file_name: string;          // Nama Asli File Laporan
  file_path: string;          // Direktori unduhan sistem (/uploads/...)
  file_size?: string;         // Ukuran File Laporan Terbaca
  catatan_mahasiswa?: string; // Catatan tambahan dari mahasiswa
  komentar?: string;          // Catatan pembetulan/arahan dari Dosen
  status: 'pending' | 'perlu_revisi' | 'disetujui';
  version: number;            // Penomoran versi terurut otomatis (1, 2, dst)
  created_at: string;         // Tanggal pengunggahan
}

// 5. logbooks
interface Logbook {
  id: string;                // ID Unik Entri Logbook
  bimbingan_id: string;      // Referensi relasional bimbingan.id
  mahasiswa_id: string;      // Referensi relasional mahasiswa.id
  bab: number;               // Bab Laporan terkait
  catatan_dosen: string;     // Arahan Dosen
  status_konfirmasi: 'pending' | 'perlu_revisi' | 'disetujui';
  created_at: string;        // Tanggal pembuatan entri logbook
}
```

---

## 🔑 Kredensial Akun Pengujian Cepat (Quick Demo Logins)

Untuk memudahkan evaluasi fungsional, tersedia pintu pintas **Demo Akun Cepat** yang tersemat pada form login:

| Akun Peran | Identitas Pengenal / NIM | Password | Info Deskriptif |
| :--- | :--- | :--- | :--- |
| **Mahasiswa 1** | `220101001` (Andi) | `mhs` | Memiliki bimbingan aktif Bab I s.d III |
| **Dosen 1** | `budi@simons.ac.id` (Dr. Budi) | `dosen` | Pembimbing Andi & Citra |
| **Admin/Kaprodi**| `admin@simons.ac.id` (Prof. Simons) | `admin` | Memiliki kontrol penuh atas master data |

---

## 🛠️ Langkah Menjalankan Aplikasi di Kampus / Localhost

### Prasyarat
- Pastikan mesin lokal Anda telah terinstalasi **Node.js (versi 18+)** dan **npm**.

### Instalasi & Menjalankan Mode Development
1. Ekstrak paket ZIP dan buka folder root proyek di terminal Anda.
2. Pasang dependensi yang diperlukan:
   ```bash
   npm install
   ```
3. Jalankan server lokal:
   ```bash
   npm run dev
   ```
4. Buka peramban (browser) Anda dan akses URL:
   `http://localhost:3000`

### Membangun Versi Produksi (Production Build & Start)
1. Lakukan kompilasi aset front-end dan backend server CJS:
   ```bash
   npm run build
   ```
2. Jalankan sistem dalam mode produksi mandiri:
   ```bash
   npm start
   ```
