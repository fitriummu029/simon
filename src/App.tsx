import React, { useState, useEffect } from 'react';
import { BookOpen, LogOut, User as UserIcon, Shield, Sparkles, Mail, MessageSquare } from 'lucide-react';
import LoginScreen from './components/LoginScreen';
import MahasiswaDashboard from './components/MahasiswaDashboard';
import DosenDashboard from './components/DosenDashboard';
import AdminDashboard from './components/AdminDashboard';
import { User, Mahasiswa, Dosen } from './types';

export default function App() {
  const [session, setSession] = useState<{
    user: User | null;
    mahasiswaInfo?: Mahasiswa | null;
    dosenInfo?: Dosen | null;
  }>({
    user: null,
    mahasiswaInfo: null,
    dosenInfo: null
  });

  const [activeToast, setActiveToast] = useState<{
    to: string;
    subject: string;
    body: string;
  } | null>(null);

  // Load existing session from localStorage for smooth reloads inside iframe
  useEffect(() => {
    const savedUser = localStorage.getItem('simon_user');
    const savedMhs = localStorage.getItem('simon_mhs_info');
    const savedDosen = localStorage.getItem('simon_dosen_info');

    if (savedUser) {
      setSession({
        user: JSON.parse(savedUser),
        mahasiswaInfo: savedMhs ? JSON.parse(savedMhs) : null,
        dosenInfo: savedDosen ? JSON.parse(savedDosen) : null
      });
    }
  }, []);

  // Poll for recently generated simulated emails to show of a native toast notification
  useEffect(() => {
    if (!session.user) return;
    
    let lastCheckedEmailId = localStorage.getItem('simon_last_email_id') || '';

    const checkEmails = async () => {
      try {
        // Only admin can access logs API natively, but we can call a general notification alert or simulate it.
        // For simplicity and 100% reliable simulation client-side, we intercept emails from system logs if role is admin
        // OR we can make a lightweight hook. Let's fetch latest email if available.
        if (session.user?.role === 'admin') {
          const res = await fetch('/api/system/logs', {
            headers: { 'x-user-id': session.user.id }
          });
          const data = await res.json();
          if (res.ok && data.emails && data.emails.length > 0) {
            const latest = data.emails[0];
            if (latest.id !== lastCheckedEmailId) {
              setActiveToast({
                to: latest.to,
                subject: latest.subject,
                body: latest.body
              });
              localStorage.setItem('simon_last_email_id', latest.id);
              
              // Auto hide toast after 8 seconds
              setTimeout(() => {
                setActiveToast(null);
              }, 8000);
            }
          }
        }
      } catch (err) {
        // Slenty handle
      }
    };

    const interval = setInterval(checkEmails, 4500);
    return () => clearInterval(interval);
  }, [session.user]);

  const handleLoginSuccess = (loginData: { user: User; mahasiswaInfo?: Mahasiswa | null; dosenInfo?: Dosen | null }) => {
    localStorage.setItem('simon_user', JSON.stringify(loginData.user));
    if (loginData.mahasiswaInfo) {
      localStorage.setItem('simon_mhs_info', JSON.stringify(loginData.mahasiswaInfo));
    }
    if (loginData.dosenInfo) {
      localStorage.setItem('simon_dosen_info', JSON.stringify(loginData.dosenInfo));
    }

    setSession({
      user: loginData.user,
      mahasiswaInfo: loginData.mahasiswaInfo,
      dosenInfo: loginData.dosenInfo
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('simon_user');
    localStorage.removeItem('simon_mhs_info');
    localStorage.removeItem('simon_dosen_info');
    localStorage.removeItem('simon_last_email_id');
    setSession({ user: null, mahasiswaInfo: null, dosenInfo: null });
    setActiveToast(null);
  };

  if (!session.user) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* GLOBAL HEADER HEADER */}
      <header className="sticky top-0 z-30 bg-blue-900 text-white shadow-md border-b border-blue-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo Group */}
            <div className="flex items-center space-x-3 select-none">
              <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center text-blue-900 shadow-inner">
                <BookOpen className="h-5 w-5 font-bold" />
              </div>
              <div>
                <span className="font-display font-black tracking-tight text-lg text-white">SiMon-S</span>
                <span className="text-[10px] block opacity-75 font-medium leading-none -mt-0.5">Monitoring Skripsi & KP</span>
              </div>
            </div>

            {/* User Session Detail & Action Block */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold leading-none">{session.user.name}</span>
                <span className="text-[10px] text-blue-200 mt-1 uppercase font-semibold tracking-wider flex items-center justify-end space-x-1">
                  <Shield className="h-3 w-3 inline text-blue-300" />
                  <span>
                    Role: {session.user.role === 'admin' ? 'Kaprodi / Admin' : 
                          session.user.role === 'dosen' ? 'Dosen Pembimbing' : 'Mahasiswa'}
                  </span>
                </span>
              </div>

              <div className="h-8 w-px bg-blue-800/60 hidden sm:block"></div>

              <button
                id="btn-global-logout"
                onClick={handleLogout}
                className="inline-flex items-center space-x-1.5 text-xs text-blue-100 hover:text-white bg-blue-950/40 hover:bg-red-900/65 px-3 py-2 rounded-xl border border-blue-800/10 transition-all cursor-pointer font-semibold"
                title="Keluar dari Sistem"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden leading-none sm:inline">Keluar</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* RENDER ACTIVE DASHBOARD SCREEN BASED ON USER ROLE */}
      <main className="flex-1 bg-slate-50/50">
        {session.user.role === 'admin' && (
          <AdminDashboard user={session.user} onLogout={handleLogout} />
        )}
        
        {session.user.role === 'dosen' && session.dosenInfo && (
          <DosenDashboard user={session.user} dosenInfo={session.dosenInfo} onLogout={handleLogout} />
        )}
        
        {session.user.role === 'mahasiswa' && session.mahasiswaInfo && (
          <MahasiswaDashboard user={session.user} mahasiswaInfo={session.mahasiswaInfo} onLogout={handleLogout} />
        )}
      </main>

      {/* ANIMATED EMAIL SIMULATOR TOAST NOTIFICATION POP-UP */}
      {activeToast && (
        <div 
          id="toast-email-notification"
          className="fixed bottom-6 right-6 z-50 max-w-sm bg-gradient-to-br from-indigo-950 to-slate-950 border border-indigo-800 rounded-2xl shadow-2xl p-4 text-white animate-slide-up"
        >
          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-900 text-indigo-300 shrink-0">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center space-x-1 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                <Mail className="h-3 w-3" />
                <span>Simulasi Email Keluar</span>
              </div>
              <h4 className="text-xs font-bold leading-tight line-clamp-1">{activeToast.subject}</h4>
              <p className="text-[10px] text-indigo-200 font-mono">Penerima: {activeToast.to}</p>
              <p className="text-[10px] text-slate-300 leading-relaxed font-serif italic border-l-2 border-indigo-500/50 pl-2">
                "{activeToast.body.substring(0, 150)}..."
              </p>
            </div>
          </div>
          <button 
            onClick={() => setActiveToast(null)} 
            className="absolute top-2 right-2 text-slate-400 hover:text-white text-xs font-semibold px-1 rounded-md"
          >
            &times;
          </button>
        </div>
      )}

      {/* FOOTER BANNER */}
      <footer className="bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400 font-medium">
        <p>&copy; 2026 SiMon-S Portal &bull; Sistem Monitoring Progress Skripsi & Kerja Praktek.</p>
        <p className="text-[10px] text-slate-300 mt-1">Struktur Stack: React 19 + Express + Sandboxed Local storage &bull; Versi 1.1.0-RC1</p>
      </footer>

    </div>
  );
}
