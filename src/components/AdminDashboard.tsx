import React, { useState, useEffect } from 'react';
import { 
  BarChart, Users, BookOpen, Key, AlertCircle, CheckCircle2, 
  Trash2, Edit2, Plus, Search, Calendar, UserCheck, Shield,
  Activity, Mail, MessageSquare, Database, Trash, KeyRound
} from 'lucide-react';
import { User, Mahasiswa, Dosen, SystemLog, EmailNotification } from '../types';

interface AdminDashboardProps {
  user: any;
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'mahasiswa' | 'dosen' | 'logs'>('stats');
  
  // Database state
  const [users, setUsers] = useState<User[]>([]);
  const [mahasiswas, setMahasiswas] = useState<Mahasiswa[]>([]);
  const [dosens, setDosens] = useState<Dosen[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [emails, setEmails] = useState<EmailNotification[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search Filters
  const [mhsSearch, setMhsSearch] = useState('');
  const [dosenSearch, setDosenSearch] = useState('');

  // Modals / Trigger states
  const [mhsModalOpen, setMhsModalOpen] = useState(false);
  const [editingMhs, setEditingMhs] = useState<Mahasiswa | null>(null);
  const [mhsForm, setMhsForm] = useState({
    name: '', email: '', password: '', nim: '', judul_skripsi: '', dosen_id: ''
  });

  const [dosenModalOpen, setDosenModalOpen] = useState(false);
  const [editingDosen, setEditingDosen] = useState<Dosen | null>(null);
  const [dosenForm, setDosenForm] = useState({
    name: '', email: '', password: '', nidn: ''
  });

  const [passwordResetOpen, setPasswordResetOpen] = useState(false);
  const [resetTargetUserId, setResetTargetUserId] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Load user accounts & profiles
      const userRes = await fetch('/api/admin/users', {
        headers: { 'x-user-id': user.id }
      });
      const userData = await userRes.json();
      
      if (!userRes.ok) {
        throw new Error(userData.error || 'Gagal memuat basis data registrasi.');
      }
      setUsers(userData.users || []);
      setMahasiswas(userData.mahasiswas || []);
      setDosens(userData.dosens || []);

      // Load action journals & mail cues
      const logRes = await fetch('/api/system/logs', {
        headers: { 'x-user-id': user.id }
      });
      const logData = await logRes.json();
      if (logRes.ok) {
        setSystemLogs(logData.systemLogs || []);
        setEmails(logData.emails || []);
      }

    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [user.id]);

  const clearFormNotification = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // --- REUSABLE PASSWORD RESET ---
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFormNotification();

    if (!resetTargetUserId || !resetNewPassword.trim()) {
      setErrorMessage('Pilih akun pengguna dan masukkan kata sandi baru.');
      return;
    }

    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          target_user_id: resetTargetUserId,
          new_password: resetNewPassword
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Gagal melakukan pembaruan sandi.');
      }

      setSuccessMessage(`Sandi pengguna berhasil diubah. Catatan log aktivitas terbit.`);
      setPasswordResetOpen(false);
      setResetNewPassword('');
      setResetTargetUserId('');
      fetchAdminData();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // --- CRUD MAHASISWA CORE ---
  const openAddMhsModal = () => {
    setEditingMhs(null);
    setMhsForm({ name: '', email: '', password: '', nim: '', judul_skripsi: '', dosen_id: dosens[0]?.id || '' });
    setMhsModalOpen(true);
    clearFormNotification();
  };

  const openEditMhsModal = (mhs: Mahasiswa) => {
    const matchedUser = users.find(u => u.id === mhs.user_id);
    setEditingMhs(mhs);
    setMhsForm({
      name: mhs.name,
      email: matchedUser?.email || '',
      password: '', // Kept empty or default during edit
      nim: mhs.nim,
      judul_skripsi: mhs.judul_skripsi,
      dosen_id: mhs.dosen_id
    });
    setMhsModalOpen(true);
    clearFormNotification();
  };

  const handleMhsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFormNotification();

    const isEdit = !!editingMhs;
    const url = isEdit ? `/api/admin/mahasiswa/${editingMhs.id}` : '/api/admin/mahasiswa';
    const method = isEdit ? 'PUT' : 'POST';

    // Password required only during create
    if (!isEdit && (!mhsForm.name || !mhsForm.email || !mhsForm.password || !mhsForm.nim || !mhsForm.judul_skripsi || !mhsForm.dosen_id)) {
      setErrorMessage('Semua field input data mahasiswa wajib dilengkapi.');
      return;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify(mhsForm)
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Kegagalan memproses data mahasiswa.');
      }

      setSuccessMessage(isEdit ? 'Profil mahasiswa berhasil dimodifikasi.' : 'Berhasil mendaftarkan mahasiswa baru.');
      setMhsModalOpen(false);
      fetchAdminData();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleMhsDelete = async (mhsId: string, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus mahasiswa "${name}" beserta seluruh histori bimbingan terkait? Tindakan ini permanen.`)) {
      return;
    }
    clearFormNotification();

    try {
      const response = await fetch(`/api/admin/mahasiswa/${mhsId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.id }
      });
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Gagal menghapus mahasiswa.');
      }
      setSuccessMessage(`Sukses mengeleminasi mahasiswa "${name}" dari sistem.`);
      fetchAdminData();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // --- CRUD DOSEN CORE ---
  const openAddDosenModal = () => {
    setEditingDosen(null);
    setDosenForm({ name: '', email: '', password: '', nidn: '' });
    setDosenModalOpen(true);
    clearFormNotification();
  };

  const openEditDosenModal = (ds: Dosen) => {
    const matchedUser = users.find(u => u.id === ds.user_id);
    setEditingDosen(ds);
    setDosenForm({
      name: ds.name,
      email: matchedUser?.email || '',
      password: '',
      nidn: ds.nidn
    });
    setDosenModalOpen(true);
    clearFormNotification();
  };

  const handleDosenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFormNotification();

    const isEdit = !!editingDosen;
    const url = isEdit ? `/api/admin/dosen/${editingDosen.id}` : '/api/admin/dosen';
    const method = isEdit ? 'PUT' : 'POST';

    if (!isEdit && (!dosenForm.name || !dosenForm.email || !dosenForm.password || !dosenForm.nidn)) {
      setErrorMessage('Lengkapi NIDN, Nama, Email, dan Password Dosen Pembimbing.');
      return;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify(dosenForm)
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Gagal memproses data dosen.');
      }

      setSuccessMessage(isEdit ? 'Data profil dosen berhasil dimutakhirkan.' : 'Dosen Pembimbing berhasil ditambahkan.');
      setDosenModalOpen(false);
      fetchAdminData();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleDosenDelete = async (dosenId: string, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus dosen "${name}"?`)) {
      return;
    }
    clearFormNotification();

    try {
      const response = await fetch(`/api/admin/dosen/${dosenId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.id }
      });
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Gagal menghapus dosen.');
      }
      setSuccessMessage(`Dosen "${name}" sukses dikeluarkan dari bimbingan.`);
      fetchAdminData();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Filter lists
  const filteredMahasiswas = mahasiswas.filter(m => 
    m.name.toLowerCase().includes(mhsSearch.toLowerCase()) || 
    m.nim.includes(mhsSearch) ||
    m.judul_skripsi.toLowerCase().includes(mhsSearch.toLowerCase())
  );

  const filteredDosens = dosens.filter(d => 
    d.name.toLowerCase().includes(dosenSearch.toLowerCase()) || 
    d.nidn.includes(dosenSearch)
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Overview Block */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center space-x-2 text-blue-900 mb-1">
            <Shield className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Modul Administrator / Kaprodi</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Sistem SiMon-S Portal Utama</h1>
          <p className="text-xs text-slate-400 mt-1">Sesi Aktif: Kaprodi Informatika &bull; Kontrol Master Akademik</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            id="btn-open-reset-password"
            onClick={() => {
              setPasswordResetOpen(!passwordResetOpen);
              clearFormNotification();
            }}
            className="inline-flex items-center space-x-1 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-2.5 rounded-xl cursor-pointer transition-all"
          >
            <KeyRound className="h-4 w-4" />
            <span>Reset Password Akun</span>
          </button>

          <button
            onClick={fetchAdminData}
            className="p-2.5 text-slate-500 hover:text-blue-900 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer"
            title="Sinkronisasi Basis Data"
          >
            <Database className="h-4 w-4" />
          </button>
        </div>
      </div>

      {successMessage && (
        <div id="admin-success-banner" className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl flex items-start space-x-3 shadow-sm text-sm text-emerald-800 font-medium">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div id="admin-error-banner" className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-start space-x-3 shadow-sm text-sm text-red-850 font-medium">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Password Reset Modal dropdown */}
      {passwordResetOpen && (
        <form onSubmit={handleResetPasswordSubmit} className="mb-8 p-6 bg-slate-50 rounded-2xl border border-blue-200/50 shadow-md max-w-xl animate-slide-down">
          <h2 className="text-sm font-bold text-blue-950 mb-4 flex items-center space-x-1.5">
            <Key className="h-4.5 w-4.5 text-blue-800" />
            <span>Reset Kredensial Akses Pengguna</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Target Pengguna</label>
              <select
                id="select-reset-user"
                value={resetTargetUserId}
                onChange={(e) => setResetTargetUserId(e.target.value)}
                className="block w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-800"
              >
                <option value="">-- Pilih User Akun --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role.toUpperCase()})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Password Baru</label>
              <input
                id="reset-password-input"
                type="text"
                placeholder="Buat password baru"
                value={resetNewPassword}
                onChange={(e) => setResetNewPassword(e.target.value)}
                className="block w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:border-blue-800"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setPasswordResetOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
            >
              Batal
            </button>
            <button
              id="btn-reset-password-submit"
              type="submit"
              className="px-3.5 py-1.5 bg-blue-800 text-white font-semibold text-xs rounded-lg hover:bg-blue-900 cursor-pointer"
            >
              Ubah Sandi Akun
            </button>
          </div>
        </form>
      )}

      {/* Main Tab Bar Controls */}
      <div className="flex border-b border-slate-100 mb-8 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('stats')}
          className={`pb-3.5 px-4 font-display text-sm font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
            activeTab === 'stats' 
              ? 'border-blue-800 text-blue-900' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Visual Progres & Statistik
        </button>
        <button
          onClick={() => setActiveTab('mahasiswa')}
          className={`pb-3.5 px-4 font-display text-sm font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
            activeTab === 'mahasiswa' 
              ? 'border-blue-800 text-blue-900' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Kelola Data Mahasiswa
        </button>
        <button
          onClick={() => setActiveTab('dosen')}
          className={`pb-3.5 px-4 font-display text-sm font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
            activeTab === 'dosen' 
              ? 'border-blue-800 text-blue-900' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Kelola Data Dosen
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3.5 px-4 font-display text-sm font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
            activeTab === 'logs' 
              ? 'border-blue-800 text-blue-900' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Aktivitas & Log Notifikasi
        </button>
      </div>

      {/* --- TAB VIEW 1: STATS & METRICS --- */}
      {activeTab === 'stats' && (
        <div className="space-y-8">
          {/* Bento Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
              <div className="p-3.5 rounded-xl bg-blue-50 text-blue-800">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase">Jumlah Mahasiswa</span>
                <span className="text-2xl font-bold text-slate-900">{mahasiswas.length}</span>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
              <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-800">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase">Dosen Pembimbing</span>
                <span className="text-2xl font-bold text-slate-900">{dosens.length}</span>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
              <div className="p-3.5 rounded-xl bg-purple-50 text-purple-800">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase">Log Aktivitas</span>
                <span className="text-2xl font-bold text-slate-900">{systemLogs.length}</span>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
              <div className="p-3.5 rounded-xl bg-orange-50 text-orange-800">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase">Email Terkirim</span>
                <span className="text-2xl font-bold text-slate-900">{emails.length}</span>
              </div>
            </div>
          </div>

          {/* Graphical Chapter progression monitor */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center space-x-2">
              <BarChart className="h-5 w-5 text-blue-800" />
              <span>Statistik Kumulatif Kemajuan Skripsi & Tugas Akhir</span>
            </h3>

            <div className="space-y-4">
              {mahasiswas.map((m) => {
                // Determine their mock completed progress
                const matDosen = dosens.find(d => d.id === m.dosen_id);
                return (
                  <div key={m.id} className="border border-slate-50 rounded-xl p-4 hover:bg-slate-50/50 transition-all">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{m.name} <span className="text-xs text-slate-400">({m.nim})</span></h4>
                        <p className="text-xs text-slate-500 font-medium truncate max-w-xl">TA: "{m.judul_skripsi}"</p>
                      </div>
                      <span className="text-xs text-slate-500">
                        Pembimbing: <strong className="font-semibold text-slate-800">{matDosen?.name || 'N/A'}</strong>
                      </span>
                    </div>

                    {/* Progress slider bar representation */}
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-800 h-full rounded-full" style={{ width: `45%` }}></div> {/* Simulated average width metric */}
                      </div>
                      <span className="text-xs font-bold text-blue-900 font-mono">Bab 1-3 Lulus</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB VIEW 2: MANAGE STUDENTS --- */}
      {activeTab === 'mahasiswa' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 border border-slate-100 rounded-xl">
            <div className="relative w-full sm:w-80">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                id="search-mhs-input"
                type="text"
                placeholder="Cari NIM, Nama, atau Judul..."
                value={mhsSearch}
                onChange={(e) => setMhsSearch(e.target.value)}
                className="pl-9 pr-3 py-2 w-full border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-800"
              />
            </div>

            <button
              id="btn-add-mhs"
              onClick={openAddMhsModal}
              className="inline-flex items-center space-x-1 py-2 px-4 bg-blue-800 text-white hover:bg-blue-900 text-xs font-bold rounded-xl cursor-pointer transition-all w-full sm:w-auto justify-center"
            >
              <Plus className="h-4 w-4" />
              <span>Registrasi Mahasiswa</span>
            </button>
          </div>

          {/* Student Add/Edit Modal */}
          {mhsModalOpen && (
            <form onSubmit={handleMhsSubmit} className="bg-slate-50 p-6 border border-slate-200 rounded-2xl relative space-y-4 animate-slide-down">
              <h3 className="text-sm font-bold text-slate-900 uppercase">
                {editingMhs ? `Modifikasi Profil: ${editingMhs.name}` : 'Form Registrasi Mahasiswa Bimbingan Baru'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Nomor Induk Mahasiswa (NIM)</label>
                  <input
                    id="form-mhs-nim"
                    type="text"
                    required
                    placeholder="cth: 220101001"
                    value={mhsForm.nim}
                    onChange={(e) => setMhsForm({...mhsForm, nim: e.target.value})}
                    className="block w-full bg-white p-2 border border-slate-200 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Nama Lengkap Mahasiswa</label>
                  <input
                    id="form-mhs-name"
                    type="text"
                    required
                    placeholder="cth: Andi Wijaya"
                    value={mhsForm.name}
                    onChange={(e) => setMhsForm({...mhsForm, name: e.target.value})}
                    className="block w-full bg-white p-2 border border-slate-200 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Alamat Surat Elektronik (Email)</label>
                  <input
                    id="form-mhs-email"
                    type="email"
                    required
                    placeholder="cth: andi@simons.ac.id"
                    value={mhsForm.email}
                    onChange={(e) => setMhsForm({...mhsForm, email: e.target.value})}
                    className="block w-full bg-white p-2 border border-slate-200 rounded text-xs"
                  />
                </div>
                
                {!editingMhs && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Kata Sandi Default</label>
                    <input
                      id="form-mhs-password"
                      type="password"
                      required
                      placeholder="Masukkan password akun baru"
                      value={mhsForm.password}
                      onChange={(e) => setMhsForm({...mhsForm, password: e.target.value})}
                      className="block w-full bg-white p-2 border border-slate-200 rounded text-xs"
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">Judul Skripsi / Kerja Praktek</label>
                  <input
                    id="form-mhs-judul"
                    type="text"
                    required
                    placeholder="cth: Rancang Bangun Sistem Smart Garden berbasis IoT..."
                    value={mhsForm.judul_skripsi}
                    onChange={(e) => setMhsForm({...mhsForm, judul_skripsi: e.target.value})}
                    className="block w-full bg-white p-2 border border-slate-200 rounded text-xs"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">Dosen Pembimbing Utama</label>
                  <select
                    id="form-mhs-dosen"
                    value={mhsForm.dosen_id}
                    onChange={(e) => setMhsForm({...mhsForm, dosen_id: e.target.value})}
                    className="block w-full bg-white p-2 border border-slate-200 rounded text-xs"
                  >
                    <option value="">-- Tentukan Dosen --</option>
                    {dosens.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} (NIDN: {d.nidn})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMhsModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  id="btn-form-mhs-submit"
                  type="submit"
                  className="px-4 py-1.5 bg-blue-800 hover:bg-blue-900 text-white font-semibold text-xs rounded-lg cursor-pointer"
                >
                  {editingMhs ? 'Perbarui Profil' : 'Daftarkan Akun'}
                </button>
              </div>
            </form>
          )}

          {/* Student Table */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Registrasi Akun Mahasiswa ({filteredMahasiswas.length})</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-left text-slate-500">
                <thead className="bg-slate-50 border-b border-slate-100 font-extrabold uppercase text-slate-400">
                  <tr>
                    <th scope="col" className="px-4 py-3">NIM</th>
                    <th scope="col" className="px-4 py-3">Nama</th>
                    <th scope="col" className="px-4 py-3">Email</th>
                    <th scope="col" className="px-4 py-3">Judul Skripsi</th>
                    <th scope="col" className="px-4 py-3">Dosen Pembimbing</th>
                    <th scope="col" className="px-4 py-3 text-right">Aksi Kontrol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMahasiswas.map((m) => {
                    const matchedUser = users.find(u => u.id === m.user_id);
                    const matchedDosen = dosens.find(d => d.id === m.dosen_id);
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/50 transition-all">
                        <td className="px-4 py-3 whitespace-nowrap font-semibold font-mono text-slate-900">
                          {m.nim}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-800">
                          {m.name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {matchedUser?.email}
                        </td>
                        <td className="px-4 py-3 max-w-sm truncate italic" title={m.judul_skripsi}>
                          "{m.judul_skripsi}"
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-semibold text-blue-900">
                          {matchedDosen ? matchedDosen.name : <span className="text-rose-500">Belum Ada</span>}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => openEditMhsModal(m)}
                            className="p-1.5 text-blue-800 hover:bg-blue-50 rounded mr-1"
                            title="Edit Profil"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleMhsDelete(m.id, m.name)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                            title="Hapus Akun"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB VIEW 3: MANAGE LECTURERS --- */}
      {activeTab === 'dosen' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 border border-slate-100 rounded-xl">
            <div className="relative w-full sm:w-80">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                id="search-dosen-input"
                type="text"
                placeholder="Cari Nama atau NIDN..."
                value={dosenSearch}
                onChange={(e) => setDosenSearch(e.target.value)}
                className="pl-9 pr-3 py-2 w-full border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-800"
              />
            </div>

            <button
              id="btn-add-dosen"
              onClick={openAddDosenModal}
              className="inline-flex items-center space-x-1 py-2 px-4 bg-blue-800 text-white hover:bg-blue-900 text-xs font-bold rounded-xl cursor-pointer transition-all w-full sm:w-auto justify-center"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Dosen</span>
            </button>
          </div>

          {/* Dosen Modal form */}
          {dosenModalOpen && (
            <form onSubmit={handleDosenSubmit} className="bg-slate-50 p-6 border border-slate-200 rounded-2xl relative space-y-4 animate-slide-down">
              <h3 className="text-sm font-bold text-slate-900 uppercase">
                {editingDosen ? `Modifikasi Dosen: ${editingDosen.name}` : 'Form Tambah Dosen Pembimbing Baru'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">NIDN (Nomor Induk Dosen)</label>
                  <input
                    id="form-dosen-nidn"
                    type="text"
                    required
                    placeholder="cth: 0412038401"
                    value={dosenForm.nidn}
                    onChange={(e) => setDosenForm({...dosenForm, nidn: e.target.value})}
                    className="block w-full bg-white p-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Nama Lengkap & Gelar</label>
                  <input
                    id="form-dosen-name"
                    type="text"
                    required
                    placeholder="cth: Dr. Ir. Budi Santoso, M.T."
                    value={dosenForm.name}
                    onChange={(e) => setDosenForm({...dosenForm, name: e.target.value})}
                    className="block w-full bg-white p-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Email</label>
                  <input
                    id="form-dosen-email"
                    type="email"
                    required
                    placeholder="cth: budi@simons.ac.id"
                    value={dosenForm.email}
                    onChange={(e) => setDosenForm({...dosenForm, email: e.target.value})}
                    className="block w-full bg-white p-2"
                  />
                </div>
                {!editingDosen && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Password Default</label>
                    <input
                      id="form-dosen-password"
                      type="password"
                      required
                      placeholder="Simpan sandi default"
                      value={dosenForm.password}
                      onChange={(e) => setDosenForm({...dosenForm, password: e.target.value})}
                      className="block w-full bg-white p-2"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDosenModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  id="btn-form-dosen-submit"
                  type="submit"
                  className="px-4 py-1.5 bg-blue-800 hover:bg-blue-900 text-white font-semibold text-xs rounded-lg cursor-pointer"
                >
                  {editingDosen ? 'Perbarui Profil' : 'Tambahkan Dosen'}
                </button>
              </div>
            </form>
          )}

          {/* Lecturers catalog */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Katalog Dosen Pembimbing ({filteredDosens.length})</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-left text-slate-500">
                <thead className="bg-slate-50 border-b border-slate-100 font-extrabold uppercase text-slate-400">
                  <tr>
                    <th scope="col" className="px-4 py-3">NIDN</th>
                    <th scope="col" className="px-4 py-3">Nama</th>
                    <th scope="col" className="px-4 py-3">Email</th>
                    <th scope="col" className="px-4 py-3">Kapasitas Bimbingan</th>
                    <th scope="col" className="px-4 py-3 text-right">Aksi Kontrol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDosens.map((d) => {
                    const matchedUser = users.find(u => u.id === d.user_id);
                    const guideCount = mahasiswas.filter(m => m.dosen_id === d.id).length;
                    return (
                      <tr key={d.id} className="hover:bg-slate-50/50 transition-all">
                        <td className="px-4 py-3 font-semibold font-mono text-slate-900">
                          {d.nidn}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-800">
                          {d.name}
                        </td>
                        <td className="px-4 py-3">
                          {matchedUser?.email}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold">{guideCount} Mahasiswa Bimbingan</span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => openEditDosenModal(d)}
                            className="p-1.5 text-blue-800 hover:bg-blue-50 rounded mr-1"
                            title="Edit Profil"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDosenDelete(d.id, d.name)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                            title="Hapus Akun"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB VIEW 4: SYSTEM & NOTIFICATION MAIL LOGS --- */}
      {activeTab === 'logs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Real-time system actions activity feed */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center space-x-1.5 uppercase">
              <Activity className="h-4.5 w-4.5 text-blue-800 shrink-0" />
              <span>Monitoring Aktivitas Sistem Terkini</span>
            </h3>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {systemLogs.map((log) => (
                <div key={log.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded">{log.user}</span>
                    <span className="text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-blue-950">{log.action}</h4>
                  <p className="text-[11px] text-slate-600 font-medium">{log.details}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Outbox Queue of simulated email notifications */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-indigo-950 mb-6 flex items-center space-x-1.5 uppercase">
              <Mail className="h-4.5 w-4.5 text-indigo-800 shrink-0" />
              <span>Log Notifikasi Email Terkirim</span>
            </h2>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {emails.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">Belum ada email notifikasi yang terkirim di sistem.</p>
              ) : (
                emails.map((em) => (
                  <div key={em.id} className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-[10px] pb-1.5 border-b border-blue-100/50">
                      <span className="font-bold text-blue-900">Kepada: {em.to}</span>
                      <span className="text-slate-400 font-medium">{new Date(em.timestamp).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-xs font-bold text-blue-950">{em.subject}</h4>
                    <p className="text-[11px] text-slate-700 font-serif leading-relaxed italic whitespace-pre-line">
                      {em.body}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
