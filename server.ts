import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { AppDatabase, User, Mahasiswa, Dosen, Bimbingan, Logbook, SystemLog, EmailNotification } from "./src/types";

// Ensure upload and DB directory exist
const DB_FILE = path.join(process.cwd(), "db.json");
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Database helper functions
function readDb(): AppDatabase {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading database file, using fallback", err);
  }
  return { users: [], mahasiswas: [], dosens: [], bimbingans: [], logbooks: [], systemLogs: [], emails: [] };
}

function writeDb(db: AppDatabase) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing database file", err);
  }
}

function appendLog(user: string, action: string, details: string) {
  const db = readDb();
  const newLog: SystemLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    user,
    action,
    details
  };
  db.systemLogs.unshift(newLog); // Put newest logs first
  writeDb(db);
}

function sendSimulatedEmail(to: string, subject: string, body: string) {
  const db = readDb();
  const newEmail: EmailNotification = {
    id: `em-${Date.now()}`,
    to,
    subject,
    body,
    timestamp: new Date().toISOString()
  };
  db.emails.unshift(newEmail);
  writeDb(db);
  console.log(`\n================ SIMULATED EMAIL SENT ================`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
  console.log(`======================================================\n`);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support up to 15MB payloads for Base64 document uploads (validation occurs at endpoint)
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ limit: "15mb", extended: true }));

  // Serve static uploaded files
  app.use("/uploads", express.static(UPLOAD_DIR));

  // --- API ROUTING ---

  // 1. Auth Endpoint
  app.post("/api/login", (req, res) => {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Nama dan password harus diisi." });
    }

    const db = readDb();
    const searchString = email.trim().toLowerCase();

    // 1. First, search across ALL users in the system to resolve the user
    let user = db.users.find(u => {
      const uNameLower = (u.name || "").toLowerCase();
      const uEmailLower = (u.email || "").toLowerCase();

      // a. Match exact email or partial email
      if (uEmailLower === searchString || uEmailLower.includes(searchString) || searchString.includes(uEmailLower)) {
        return true;
      }
      // b. Match Full Name (equal or partial)
      if (uNameLower === searchString || uNameLower.includes(searchString) || searchString.includes(uNameLower)) {
        return true;
      }
      // c. Match Role Alias (if user types "admin" and role is admin, etc.)
      if (searchString === "admin" && u.role === "admin") {
        return true;
      }
      if ((searchString === "dosen" || searchString === "budi" || searchString === "siti") && u.role === "dosen") {
        if (searchString === "budi" && uNameLower.includes("budi")) return true;
        if (searchString === "siti" && uNameLower.includes("siti")) return true;
        if (searchString === "dosen") return true; // match first dosen
      }
      if ((searchString === "mhs" || searchString === "mahasiswa" || searchString === "andi" || searchString === "bintang" || searchString === "citra") && u.role === "mahasiswa") {
        if (searchString === "andi" && uNameLower.includes("andi")) return true;
        if (searchString === "bintang" && uNameLower.includes("bintang")) return true;
        if (searchString === "citra" && uNameLower.includes("citra")) return true;
        if (searchString === "mhs" || searchString === "mahasiswa") return true; // match first student
      }
      // d. Match Student NIM
      if (u.role === "mahasiswa") {
        const mhs = db.mahasiswas.find(m => m.user_id === u.id);
        if (mhs && mhs.nim === searchString) {
          return true;
        }
      }
      // e. Match Dosen NIDN
      if (u.role === "dosen") {
        const dsn = db.dosens.find(d => d.user_id === u.id);
        if (dsn && dsn.nidn === searchString) {
          return true;
        }
      }
      return false;
    });

    // 2. If still not found, try to match by word tokens (e.g. typing "budi" for "Dr. Budi Santoso, M.T.")
    if (!user) {
      user = db.users.find(u => {
        const words = (u.name || "").toLowerCase().split(/[.\s(),]+/);
        return words.includes(searchString) || (u.name || "").toLowerCase().replace(/[^a-z0-9]/g, "").includes(searchString);
      });
    }

    // 3. Handle errors with clear and explicit instructions
    if (!user) {
      return res.status(401).json({ 
        error: `Pengguna dengan nama "${email}" tidak ditemukan di database. Pastikan nama yang Anda masukkan sudah benar.` 
      });
    }

    // 4. Verify selected role matches user's actual role, giving an extremely specific hint
    if (role && user.role !== role) {
      const actualRoleLabel = user.role === 'admin' ? 'Admin' : user.role === 'dosen' ? 'Dosen' : 'Mahasiswa';
      const selectedRoleLabel = role === 'admin' ? 'Admin' : role === 'dosen' ? 'Dosen' : 'Mahasiswa';
      return res.status(401).json({ 
        error: `Nama "${user.name}" terdaftar sebagai "${actualRoleLabel}", tetapi pilihan login Anda adalah "${selectedRoleLabel}". Silakan klik tombol "${actualRoleLabel}" pada pilihan login di bawah!`
      });
    }

    // 5. Verify password
    if (user.password !== password) {
      return res.status(401).json({ 
        error: `Kata sandi salah untuk nama "${user.name}". Silakan gunakan kata sandi yang sesuai.` 
      });
    }

    // Prepare response based on role
    let mahasiswaInfo: Mahasiswa | null = null;
    let dosenInfo: Dosen | null = null;

    if (user.role === "mahasiswa") {
      mahasiswaInfo = db.mahasiswas.find(m => m.user_id === user!.id) || null;
    } else if (user.role === "dosen") {
      dosenInfo = db.dosens.find(d => d.user_id === user!.id) || null;
    }

    appendLog(user.name, "Login Successful", `User logged in with role [${user.role}].`);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      mahasiswaInfo,
      dosenInfo
    });
  });

  // RBAC Express Middleware implementation
  const checkRole = (allowedRoles: string[]) => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const userId = req.headers["x-user-id"] as string;
      if (!userId) {
        return res.status(401).json({ error: "Unauthenticated. Header x-user-id diperlukan." });
      }

      const db = readDb();
      const user = db.users.find(u => u.id === userId);
      if (!user) {
        return res.status(401).json({ error: "User tidak ditemukan." });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(430).json({ error: "Akses Ditolak. Anda tidak berwenang mengakses modul ini." });
      }

      // Inject user to request object
      (req as any).user = user;
      next();
    };
  };

  // 2. Mahasiswa API - Get own bimbingan state and history
  app.get("/api/mahasiswa/progress", checkRole(["mahasiswa"]), (req, res) => {
    const user = (req as any).user as User;
    const db = readDb();
    
    const mhs = db.mahasiswas.find(m => m.user_id === user.id);
    if (!mhs) {
      return res.status(404).json({ error: "Data mahasiswa tidak ditemukan." });
    }

    const bimbinganList = db.bimbingans.filter(b => b.mahasiswa_id === mhs.id);
    const dosen = db.dosens.find(d => d.id === mhs.dosen_id);

    res.json({
      mahasiswa: mhs,
      dosen: dosen || null,
      bimbingans: bimbinganList
    });
  });

  // 3. Mahasiswa API - Upload revision with validation
  app.post("/api/mahasiswa/upload", checkRole(["mahasiswa"]), (req, res) => {
    const user = (req as any).user;
    const { bab, file_name, file_base64, file_size_bytes, catatan_mahasiswa } = req.body;

    const parsedBab = parseInt(bab);
    if (isNaN(parsedBab) || parsedBab < 1 || parsedBab > 7) {
      return res.status(400).json({ error: "Bab skripsi harus antara 1 sampai 7." });
    }

    if (!file_name || !file_base64) {
      return res.status(400).json({ error: "File revisi dan nama file wajib disertakan." });
    }

    // Size Validation (Max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file_size_bytes && file_size_bytes > MAX_SIZE) {
      return res.status(400).json({ error: "File terlalu besar. Maksimal ukuran file bimbingan adalah 10MB." });
    }

    // Type Validation (PDF or DOCX or DOC)
    const allowedExtensions = [".pdf", ".docx", ".doc"];
    const ext = path.extname(file_name).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return res.status(400).json({ error: "Format file tidak didukung. Hanya menerima file PDF atau Word (.docx / .doc)." });
    }

    const db = readDb();
    const mhs = db.mahasiswas.find(m => m.user_id === user.id);
    if (!mhs) {
      return res.status(404).json({ error: "Data mahasiswa tidak ditemukan." });
    }

    // Version Control (find latest version for this student and this specific bab)
    const existingRevisions = db.bimbingans.filter(b => b.mahasiswa_id === mhs.id && b.bab === parsedBab);
    const nextVersion = existingRevisions.length > 0 
      ? Math.max(...existingRevisions.map(r => r.version)) + 1 
      : 1;

    // Save actual file on system disk
    const systemFileName = `mhs_${mhs.id}_bab${parsedBab}_v${nextVersion}${ext}`;
    const filePathOnDisk = path.join(UPLOAD_DIR, systemFileName);
    
    try {
      // Decode base64 and save
      const base64Data = file_base64.replace(/^data:.*;base64,/, "");
      fs.writeFileSync(filePathOnDisk, base64Data, 'base64');
    } catch (err: any) {
      console.error("Failed to write uploaded file to disk", err);
      return res.status(500).json({ error: "Gagal menyimpan file ke server." });
    }

    // Create new Bimbingan record
    const newBimbingan: Bimbingan = {
      id: `b-${Date.now()}`,
      mahasiswa_id: mhs.id,
      dosen_id: mhs.dosen_id,
      bab: parsedBab,
      file_name: file_name,
      file_path: `/uploads/${systemFileName}`,
      file_size: `${(file_size_bytes / (1024 * 1024)).toFixed(2)} MB`,
      catatan_mahasiswa: catatan_mahasiswa || "",
      komentar: "",
      status: "pending",
      version: nextVersion,
      created_at: new Date().toISOString()
    };

    db.bimbingans.push(newBimbingan);
    writeDb(db);

    // Trigger System Log & simulated Email to Dosen
    appendLog(user.name, "Upload Revisi", `Mengunggah berkas Bab ${parsedBab} Versi ${nextVersion} (${file_name}).`);

    const targetDosen = db.dosens.find(d => d.id === mhs.dosen_id);
    if (targetDosen) {
      const dosenUser = db.users.find(u => u.id === targetDosen.user_id);
      if (dosenUser) {
        sendSimulatedEmail(
          dosenUser.email,
          `[SiMon-S] Bimbingan Baru: Bab ${parsedBab} - ${mhs.name}`,
          `Halo ${targetDosen.name},\n\nMahasiswa bimbingan Anda, ${mhs.name} (NIM: ${mhs.nim}) baru saja mengunggah draf revisi terbaru untuk Bab ${parsedBab} Versi ${nextVersion}.\n\nCatatan Mahasiswa: "${catatan_mahasiswa || '-'}"\nSilakan kunjungi dashboard SiMon-S Anda untuk melakukan peninjauan dan konfirmasi.\n\nSalam,\nSistem SiMon-S`
        );
      }
    }

    res.json({ message: "File berhasil diunggah dan diajukan.", bimbingan: newBimbingan });
  });

  // 4. Dosen API - Get bimbingan list for students under supervision
  app.get("/api/dosen/bimbingan", checkRole(["dosen"]), (req, res) => {
    const user = (req as any).user;
    const db = readDb();

    const dosen = db.dosens.find(d => d.user_id === user.id);
    if (!dosen) {
      return res.status(404).json({ error: "Data dosen tidak draf-terdaftar." });
    }

    // Get all students guided by this lecturer
    const students = db.mahasiswas.filter(m => m.dosen_id === dosen.id);
    
    // Get bimbingan records for all these students
    const studentIds = students.map(s => s.id);
    const bimbingans = db.bimbingans.filter(b => studentIds.includes(b.mahasiswa_id));

    res.json({
      students,
      bimbingans
    });
  });

  // 5. Dosen API - Submit review comments and set status (Approve / Request Revision)
  app.post("/api/dosen/review", checkRole(["dosen"]), (req, res) => {
    const user = (req as any).user;
    const { bimbingan_id, status, komentar } = req.body;

    if (!bimbingan_id || !status) {
      return res.status(400).json({ error: "ID Bimbingan dan status peninjauan harus disertakan." });
    }

    if (!["disetujui", "perlu_revisi"].includes(status)) {
      return res.status(400).json({ error: "Status peninjauan harus 'disetujui' atau 'perlu_revisi'." });
    }

    const db = readDb();
    const bimbinganIndex = db.bimbingans.findIndex(b => b.id === bimbingan_id);
    if (bimbinganIndex === -1) {
      return res.status(404).json({ error: "Data bimbingan tidak ditemukan." });
    }

    const bimbingan = db.bimbingans[bimbinganIndex];
    bimbingan.status = status;
    bimbingan.komentar = komentar || "";

    // Write to Logbook table (minimally containing: bimbingan_id, catatan_dosen, status_konfirmasi)
    const logbook: Logbook = {
      id: `l-${Date.now()}`,
      bimbingan_id: bimbingan.id,
      mahasiswa_id: bimbingan.mahasiswa_id,
      bab: bimbingan.bab,
      catatan_dosen: komentar || "",
      status_konfirmasi: status as any,
      created_at: new Date().toISOString()
    };
    db.logbooks.push(logbook);
    writeDb(db);

    // Logs & Emails triggers
    const mhs = db.mahasiswas.find(m => m.id === bimbingan.mahasiswa_id);
    const lecturer = db.dosens.find(d => d.user_id === user.id);
    
    if (mhs) {
      appendLog(
        lecturer?.name || user.name,
        "Review Bimbingan",
        `Memvalidasi Bab ${bimbingan.bab} mahasiswa ${mhs.name} dengan status: ${status.toUpperCase()}.`
      );

      const mhsUser = db.users.find(u => u.id === mhs.user_id);
      if (mhsUser) {
        const subject = status === "disetujui" 
          ? `[SiMon-S] Selamat! Bab ${bimbingan.bab} Anda Telah DISETUJUI`
          : `[SiMon-S] Perbaikan Diperlukan: Bab ${bimbingan.bab} Skripsi Anda`;

        const bodyText = status === "disetujui"
          ? `Halo ${mhs.name},\n\nKabar gembira! Bab ${bimbingan.bab} Skripsi Anda yang berjudul "${mhs.judul_skripsi}" telah disetujui oleh Dosen Pembimbing Anda, ${lecturer?.name}.\n\nCatatan/Pujian dari dosen: "${komentar || 'Silakan lanjut ke bab berikutnya.'}"\n\nSalam semangat,\nSistem SiMon-S`
          : `Halo ${mhs.name},\n\nRevisi baru diajukan oleh Dosen Pembimbing Anda, ${lecturer?.name}, untuk draf Bab ${bimbingan.bab} Anda.\n\nCatatan Perbaikan: "${komentar || 'Mohon cek catatan perbaikan di file bimbingan.'}"\nSilakan perbaiki dokumen Anda lalu unggah kembali revisi terbaru melalui modul SiMon-S.\n\nSalam,\nSistem SiMon-S`;

        sendSimulatedEmail(mhsUser.email, subject, bodyText);
      }
    }

    res.json({ message: "Review berhasil disimpan.", bimbingan, logbook });
  });

  // 6. Admin Module APIs - Manage Students and Lecturers (CRUD)
  // Get all system users & profiles
  app.get("/api/admin/users", checkRole(["admin"]), (req, res) => {
    const db = readDb();
    res.json({
      users: db.users,
      mahasiswas: db.mahasiswas,
      dosens: db.dosens
    });
  });

  // Admin: Create/Add Mahasiswa
  app.post("/api/admin/mahasiswa", checkRole(["admin"]), (req, res) => {
    const adminUser = (req as any).user;
    const { name, email, password, nim, judul_skripsi, dosen_id } = req.body;

    if (!name || !email || !password || !nim || !judul_skripsi || !dosen_id) {
      return res.status(400).json({ error: "Semua data mahasiswa (Nama, Email, Password, NIM, Judul, Dosen) wajib diisi." });
    }

    const db = readDb();
    // Validate uniqueness
    if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: "Email sudah digunakan oleh user lain." });
    }
    if (db.mahasiswas.some(m => m.nim === nim)) {
      return res.status(400).json({ error: "NIM sudah terdaftar dalam sistem." });
    }

    const userId = `u-m-${Date.now()}`;
    const mhsId = `m-${Date.now()}`;

    const newUser: User = { id: userId, name, email, password, role: "mahasiswa" };
    const newMhs: Mahasiswa = { id: mhsId, user_id: userId, nim, name, judul_skripsi, dosen_id };

    db.users.push(newUser);
    db.mahasiswas.push(newMhs);
    writeDb(db);

    appendLog(adminUser.name, "CRUD Mahasiswa", `Menambahkan Mahasiswa Baru: ${name} (NIM: ${nim}).`);
    res.json({ message: "Mahasiswa berhasil ditambahkan.", user: newUser, data: newMhs });
  });

  // Admin: Update Mahasiswa
  app.put("/api/admin/mahasiswa/:id", checkRole(["admin"]), (req, res) => {
    const adminUser = (req as any).user;
    const mhsId = req.params.id;
    const { name, email, nim, judul_skripsi, dosen_id } = req.body;

    const db = readDb();
    const mhsIndex = db.mahasiswas.findIndex(m => m.id === mhsId);
    if (mhsIndex === -1) {
      return res.status(404).json({ error: "Mahasiswa tidak ditemukan." });
    }

    const mhs = db.mahasiswas[mhsIndex];
    const userIndex = db.users.findIndex(u => u.id === mhs.user_id);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User Mahasiswa tidak sinkron." });
    }

    // Check Unique NIM / Email
    if (db.mahasiswas.some(m => m.nim === nim && m.id !== mhsId)) {
      return res.status(400).json({ error: "NIM sudah terdaftar pada mahasiswa lain." });
    }
    if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== mhs.user_id)) {
      return res.status(400).json({ error: "Email sudah terdaftar pada user lain." });
    }

    db.mahasiswas[mhsIndex] = { ...mhs, nim, name, judul_skripsi, dosen_id };
    db.users[userIndex].name = name;
    db.users[userIndex].email = email;

    writeDb(db);
    appendLog(adminUser.name, "CRUD Mahasiswa", `Memperbarui data Mahasiswa: ${name} (NIM: ${nim}).`);

    res.json({ message: "Data mahasiswa berhasil diperbarui." });
  });

  // Admin: Delete Mahasiswa
  app.delete("/api/admin/mahasiswa/:id", checkRole(["admin"]), (req, res) => {
    const adminUser = (req as any).user;
    const mhsId = req.params.id;

    const db = readDb();
    const mhsIndex = db.mahasiswas.findIndex(m => m.id === mhsId);
    if (mhsIndex === -1) {
      return res.status(404).json({ error: "Mahasiswa tidak ditemukan." });
    }

    const mhs = db.mahasiswas[mhsIndex];
    
    // Remove from users list
    db.users = db.users.filter(u => u.id !== mhs.user_id);
    // Remove from mahasiswas list
    db.mahasiswas = db.mahasiswas.filter(m => m.id !== mhsId);
    // Delete corresponding bimbingans and logbooks
    db.bimbingans = db.bimbingans.filter(b => b.mahasiswa_id !== mhsId);
    db.logbooks = db.logbooks.filter(l => l.mahasiswa_id !== mhsId);

    writeDb(db);
    appendLog(adminUser.name, "CRUD Mahasiswa", `Menghapus Mahasiswa ID: ${mhsId} (${mhs.name}).`);

    res.json({ message: "Mahasiswa beserta data terkait berhasil dihapus dari sistem." });
  });

  // Admin: Create/Add Dosen
  app.post("/api/admin/dosen", checkRole(["admin"]), (req, res) => {
    const adminUser = (req as any).user;
    const { name, email, password, nidn } = req.body;

    if (!name || !email || !password || !nidn) {
      return res.status(400).json({ error: "Semua data Dosen (Nama, Email, Password, NIDN) wajib diisi." });
    }

    const db = readDb();
    if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: "Email sudah digunakan oleh user lain." });
    }
    if (db.dosens.some(d => d.nidn === nidn)) {
      return res.status(400).json({ error: "NIDN sudah terdaftar dalam sistem." });
    }

    const userId = `u-d-${Date.now()}`;
    const dosenId = `d-${Date.now()}`;

    const newUser: User = { id: userId, name, email, password, role: "dosen" };
    const newDosen: Dosen = { id: dosenId, user_id: userId, nidn, name };

    db.users.push(newUser);
    db.dosens.push(newDosen);
    writeDb(db);

    appendLog(adminUser.name, "CRUD Dosen", `Menambahkan Dosen Baru: ${name} (NIDN: ${nidn}).`);
    res.json({ message: "Dosen berhasil ditambahkan.", user: newUser, data: newDosen });
  });

  // Admin: Update Dosen
  app.put("/api/admin/dosen/:id", checkRole(["admin"]), (req, res) => {
    const adminUser = (req as any).user;
    const dosenId = req.params.id;
    const { name, email, nidn } = req.body;

    const db = readDb();
    const dosenIndex = db.dosens.findIndex(d => d.id === dosenId);
    if (dosenIndex === -1) {
      return res.status(404).json({ error: "Dosen tidak ditemukan." });
    }

    const dosen = db.dosens[dosenIndex];
    const userIndex = db.users.findIndex(u => u.id === dosen.user_id);
    if (userIndex === -1) {
      return res.status(404).json({ error: "User Dosen tidak sinkron." });
    }

    if (db.dosens.some(d => d.nidn === nidn && d.id !== dosenId)) {
      return res.status(400).json({ error: "NIDN sudah terdaftar pada dosen lain." });
    }
    if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== dosen.user_id)) {
      return res.status(400).json({ error: "Email sudah terdaftar pada user lain." });
    }

    db.dosens[dosenIndex] = { ...dosen, nidn, name };
    db.users[userIndex].name = name;
    db.users[userIndex].email = email;

    writeDb(db);
    appendLog(adminUser.name, "CRUD Dosen", `Memperbarui data Dosen: ${name} (NIDN: ${nidn}).`);

    res.json({ message: "Data dosen berhasil diperbarui." });
  });

  // Admin: Delete Dosen
  app.delete("/api/admin/dosen/:id", checkRole(["admin"]), (req, res) => {
    const adminUser = (req as any).user;
    const dosenId = req.params.id;

    const db = readDb();
    const dosenIndex = db.dosens.findIndex(d => d.id === dosenId);
    if (dosenIndex === -1) {
      return res.status(404).json({ error: "Dosen tidak ditemukan." });
    }

    const dosen = db.dosens[dosenIndex];

    // Reassign student guide checks
    const guidedStudents = db.mahasiswas.filter(m => m.dosen_id === dosenId);
    if (guidedStudents.length > 0) {
      return res.status(400).json({ 
        error: `Dosen ini sedang membimbing ${guidedStudents.length} mahasiswa. Pindahkan dahulu bimbingan mahasiswa tersebut sebelum menghapus dosen ini.` 
      });
    }

    db.users = db.users.filter(u => u.id !== dosen.user_id);
    db.dosens = db.dosens.filter(d => d.id !== dosenId);

    writeDb(db);
    appendLog(adminUser.name, "CRUD Dosen", `Menghapus Dosen ID: ${dosenId} (${dosen.name}).`);

    res.json({ message: "Dosen berhasil dihapus dari sistem." });
  });

  // Admin & Dosen Reset password
  app.post("/api/admin/reset-password", checkRole(["admin", "dosen"]), (req, res) => {
    const authorUser = (req as any).user;
    const { target_user_id, new_password } = req.body;

    if (!target_user_id || !new_password) {
      return res.status(400).json({ error: "Target User ID dan password baru wajib disertakan." });
    }

    const db = readDb();
    const targetIndex = db.users.findIndex(u => u.id === target_user_id);
    if (targetIndex === -1) {
      return res.status(404).json({ error: "User target tidak ada." });
    }

    // Role safety restrictions: Lecturers can only reset their own password! Admin can reset anyone.
    if (authorUser.role === "dosen" && authorUser.id !== target_user_id) {
      return res.status(430).json({ error: "Akses Ditolak. Dosen hanya bisa mengubah password mereka sendiri." });
    }

    db.users[targetIndex].password = new_password;
    writeDb(db);

    appendLog(
      authorUser.name, 
      "Reset Password", 
      `Mengubah kata sandi untuk akun: ${db.users[targetIndex].name} (${db.users[targetIndex].role}).`
    );

    res.json({ message: `Password untuk ${db.users[targetIndex].name} berhasil ditiadakan/diubah.` });
  });

  // 7. General logs / simulated emails for Admin panel / Dev monitors
  app.get("/api/system/logs", checkRole(["admin"]), (req, res) => {
    const db = readDb();
    res.json({
      systemLogs: db.systemLogs,
      emails: db.emails
    });
  });

  // Optional: Schedule sidang defense
  app.post("/api/sidang/schedule", checkRole(["dosen"]), (req, res) => {
    const user = (req as any).user;
    const { mahasiswa_id, tanggal_sidang, tempat_sidang } = req.body;

    if (!mahasiswa_id || !tanggal_sidang || !tempat_sidang) {
      return res.status(400).json({ error: "Mahasiswa, Tanggal, dan Tempat Sidang wajib ditentukan." });
    }

    const db = readDb();
    const mhsIndex = db.mahasiswas.findIndex(m => m.id === mahasiswa_id);
    if (mhsIndex === -1) {
      return res.status(404).json({ error: "Mahasiswa tidak ditemukan." });
    }

    const mhs = db.mahasiswas[mhsIndex];
    mhs.tanggal_sidang = tanggal_sidang;
    mhs.tempat_sidang = tempat_sidang;

    const lecturer = db.dosens.find(d => d.user_id === user.id);
    
    // Log scheduling
    appendLog(
      lecturer?.name || user.name,
      "Sidang Scheduled",
      `Menjadwalkan Ujian/Sidang Skripsi untuk ${mhs.name} pada ${new Date(tanggal_sidang).toLocaleDateString()} di ${tempat_sidang}.`
    );

    // Send email alert to student
    const mhsUser = db.users.find(u => u.id === mhs.user_id);
    if (mhsUser) {
      sendSimulatedEmail(
        mhsUser.email,
        `[SiMon-S] JADWAL SIDANG SKRIPSI: ${mhs.name}`,
        `Halo ${mhs.name},\n\nKabar luar biasa! Dosen Pembimbing Anda, ${lecturer?.name}, baru saja menjadwalkan sidang ujian skripsi Anda.\n\nDetail Sidang:\n📅 Tanggal: ${new Date(tanggal_sidang).toLocaleString()}\n📍 Tempat: ${tempat_sidang}\n\nMohon persiapkan draf laporan lengkap dan salinan presentasi PowerPoint Anda.\n\nSelamat berjuang!\nSistem SiMon-S`
      );
    }

    // Write all changes (including student updates) back to database
    writeDb(db);

    res.json({ message: "Sidang skripsi berhasil dijadwalkan." });
  });

  // --- INTERACTION & REVERSE PROXY MIDDLEWARES ---

  // Vite development integration
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite server middleware in development...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production build from /dist...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SiMon-S full-stack server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical: Error starting server", err);
});
