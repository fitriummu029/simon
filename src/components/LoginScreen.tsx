import React, { useState } from 'react';
import { ShieldCheck, User as UserIcon, BookOpen, Key, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { UserRole } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (data: { user: any; mahasiswaInfo?: any; dosenInfo?: any }) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [emailOrNim, setEmailOrNim] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'mahasiswa' | 'dosen' | 'admin'>('mahasiswa');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrNim) {
      setError('Masukkan Nama Anda.');
      return;
    }
    if (!password) {
      setError('Masukkan password Anda.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailOrNim, password, role }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Terjadi kesalahan sistem.');
      }

      onLoginSuccess(resData);
    } catch (err: any) {
      setError(err.message || 'Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (email: string, pass: string, selectedRole: 'mahasiswa' | 'dosen' | 'admin') => {
    setEmailOrNim(email);
    setPassword(pass);
    setRole(selectedRole);
    setError(null);
  };

  return (
    <div id="login-container" className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      {/* Visual background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-100 rounded-full blur-3xl opacity-50 -ml-20 -mb-20"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-blue-800 flex items-center justify-center text-white shadow-xl shadow-blue-800/20">
            <BookOpen className="h-9 w-9" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-display font-extrabold text-blue-950 tracking-tight">
          SiMon-S
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Sistem Monitoring Progress Skripsi & Kerja Praktek
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 shadow-2xl rounded-2xl border border-slate-100 bg-white">
        <div className="py-8 px-6 sm:px-10">
          {error && (
            <div id="login-error-alert" className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <span className="text-sm text-red-700 font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="emailOrNim" className="block text-sm font-medium text-slate-700">
                Nama
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="h-4 w-4" />
                </div>
                <input
                  id="emailOrNim"
                  name="emailOrNim"
                  value={emailOrNim}
                  onChange={(e) => setEmailOrNim(e.target.value)}
                  type="text"
                  placeholder="Contoh: Andi Wijaya atau admin"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm transition-all shadow-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Kata Sandi (Password)
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Key className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan kata sandi"
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  title={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Pilihan Login Sebagai */}
            <div>
              <label htmlFor="role-select" className="block text-sm font-medium text-slate-700 mb-1.5">
                Pilihan Login Sebagai
              </label>
              <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setRole('mahasiswa')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
                    role === 'mahasiswa'
                      ? 'bg-blue-800 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  Mahasiswa
                </button>
                <button
                  type="button"
                  onClick={() => setRole('dosen')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
                    role === 'dosen'
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  Dosen
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
                    role === 'admin'
                      ? 'bg-purple-800 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

            <div>
              <button
                id="btn-login-submit"
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-800/10 text-sm font-semibold text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all cursor-pointer disabled:opacity-55"
              >
                {loading ? 'Menghubungkan...' : 'Masuk ke Sistem'}
              </button>
            </div>
          </form>

          {/* Quick Demo Login Triggers */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider text-center mb-4">
              Uji Coba Cepat (Demo Akun)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                id="btn-demo-mhs"
                type="button"
                onClick={() => handleQuickLogin('Andi Wijaya', 'mhs', 'mahasiswa')}
                className="flex flex-col items-center justify-center py-2 px-1 bg-blue-50/50 hover:bg-blue-50 border border-blue-100/50 rounded-xl text-center cursor-pointer transition-all animate-fade-in"
              >
                <span className="text-xs font-bold text-blue-950">Andi</span>
                <span className="text-[10px] text-blue-700 font-medium">Mahasiswa</span>
              </button>
              
              <button
                id="btn-demo-dosen"
                type="button"
                onClick={() => handleQuickLogin('Dr. Budi Santoso, M.T.', 'dosen', 'dosen')}
                className="flex flex-col items-center justify-center py-2 px-1 bg-green-50/50 hover:bg-green-50 border border-green-100/50 rounded-xl text-center cursor-pointer transition-all"
              >
                <span className="text-xs font-bold text-green-950">Dr. Budi</span>
                <span className="text-[10px] text-green-700 font-medium">Dosen</span>
              </button>

              <button
                id="btn-demo-admin"
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin', 'admin')}
                className="flex flex-col items-center justify-center py-2 px-1 bg-purple-50/50 hover:bg-purple-50 border border-purple-100/50 rounded-xl text-center cursor-pointer transition-all"
              >
                <span className="text-xs font-bold text-purple-950">Kaprodi</span>
                <span className="text-[10px] text-purple-700 font-medium">Kaprodi/Admin</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-3 font-medium">
              *Password masing-masing: <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-500">mhs</code> / <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-500">dosen</code> / <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-500">admin</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
