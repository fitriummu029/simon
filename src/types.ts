export type UserRole = 'mahasiswa' | 'dosen' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Stored simply for this task
  role: UserRole;
}

export interface Dosen {
  id: string; // matches user_id or unique
  user_id: string;
  nidn: string;
  name: string;
}

export interface Mahasiswa {
  id: string;
  user_id: string;
  nim: string;
  name: string;
  judul_skripsi: string;
  dosen_id: string; // references Dosen id
  tanggal_sidang?: string;
  tempat_sidang?: string;
}

export interface Bimbingan {
  id: string;
  mahasiswa_id: string;
  dosen_id: string;
  bab: number; // 1 to 7
  file_name: string;
  file_path: string; // virtual path or base64 data url reference
  file_size?: string;
  catatan_mahasiswa?: string;
  komentar?: string;
  status: 'pending' | 'perlu_revisi' | 'disetujui';
  version: number; // e.g. 1, 2, 3
  created_at: string;
}

export interface Logbook {
  id: string;
  bimbingan_id: string;
  mahasiswa_id: string;
  bab: number;
  catatan_dosen: string;
  status_konfirmasi: 'pending' | 'perlu_revisi' | 'disetujui';
  created_at: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface EmailNotification {
  id: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
}

export interface AppDatabase {
  users: User[];
  mahasiswas: Mahasiswa[];
  dosens: Dosen[];
  bimbingans: Bimbingan[];
  logbooks: Logbook[];
  systemLogs: SystemLog[];
  emails: EmailNotification[];
}
