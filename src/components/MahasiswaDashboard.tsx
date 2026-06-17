import React, { useState, useEffect } from 'react';
import { 
  FileText, Upload, CheckCircle2, AlertTriangle, Clock, 
  ChevronRight, Calendar, User, BookOpen, Download, AlertCircle 
} from 'lucide-react';
import { Bimbingan, Mahasiswa, Dosen } from '../types';

interface MahasiswaDashboardProps {
  user: any;
  mahasiswaInfo: Mahasiswa;
  onLogout: () => void;
}

export default function MahasiswaDashboard({ user, mahasiswaInfo, onLogout }: MahasiswaDashboardProps) {
  const [bimbingans, setBimbingans] = useState<Bimbingan[]>([]);
  const [dosen, setDosen] = useState<Dosen | null>(null);
  const [studentDetail, setStudentDetail] = useState<Mahasiswa>(mahasiswaInfo);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Upload Form Fields
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedBab, setSelectedBab] = useState<number>(1);
  const [catatan, setCatatan] = useState('');
  const [fileObject, setFileObject] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const babList = [
    { num: 1, title: 'Bab I: Pendahuluan' },
    { num: 2, title: 'Bab II: Tinjauan Pustaka' },
    { num: 3, title: 'Bab III: Metodologi Penelitian' },
    { num: 4, title: 'Bab IV: Analisis & Perancangan' },
    { num: 5, title: 'Bab V: Implementasi Sistem' },
    { num: 6, title: 'Bab VI: Hasil & Pembahasan' },
    { num: 7, title: 'Bab VII: Penutup & Saran' },
  ];

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/mahasiswa/progress', {
        headers: { 'x-user-id': user.id },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal memuat kemajuan bimbingan.');
      }
      setBimbingans(data.bimbingans || []);
      setDosen(data.dosen);
      if (data.mahasiswa) {
        setStudentDetail(data.mahasiswa);
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [user.id]);

  // Determine current status of each bab
  const getBabStatus = (babNum: number) => {
    const babRevisions = bimbingans.filter(b => b.bab === babNum);
    if (babRevisions.length === 0) {
      return { status: 'belum_diajukan', badge: 'Belum Diajukan', color: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
    
    // Sort to get latest
    const latest = [...babRevisions].sort((a, b) => b.version - a.version)[0];
    if (latest.status === 'disetujui') {
      return { status: 'disetujui', badge: 'Disetujui', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', record: latest };
    } else if (latest.status === 'perlu_revisi') {
      return { status: 'perlu_revisi', badge: 'Perlu Revisi', color: 'bg-rose-50 text-rose-700 border-rose-200', record: latest };
    } else {
      return { status: 'pending', badge: 'Menunggu Review', color: 'bg-amber-50 text-amber-700 border-amber-200', record: latest };
    }
  };

  // Compute overall percentage
  const getOverallProgress = () => {
    let approvedCount = 0;
    for (let i = 1; i <= 7; i++) {
      if (getBabStatus(i).status === 'disetujui') {
        approvedCount++;
      }
    }
    return Math.round((approvedCount / 7) * 100);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileObject(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fileObject) {
      setErrorMessage('Pilih berkas bimbingan (.pdf atau .docx) terlebih dahulu.');
      return;
    }

    // Size Validation (Max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (fileObject.size > MAX_SIZE) {
      setErrorMessage('Berkas tidak boleh melebihi batas 10MB.');
      return;
    }

    // Extension Validation
    const extIndex = fileObject.name.lastIndexOf('.');
    const ext = extIndex !== -1 ? fileObject.name.slice(extIndex).toLowerCase() : '';
    if (!['.pdf', '.docx', '.doc'].includes(ext)) {
      setErrorMessage('Format berkas tidak didukung. Harap upload format PDF atau Word (.docx / .doc).');
      return;
    }

    setUploading(true);

    try {
      // Read file to Base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Content = reader.result as string;
        
        try {
          const response = await fetch('/api/mahasiswa/upload', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-user-id': user.id
            },
            body: JSON.stringify({
              bab: selectedBab,
              file_name: fileObject.name,
              file_base64: base64Content,
              file_size_bytes: fileObject.size,
              catatan_mahasiswa: catatan
            }),
          });

          const resData = await response.json();
          if (!response.ok) {
            throw new Error(resData.error || 'Gagal mengirimkan revisi.');
          }

          setSuccessMessage(`Berhasil mengajukan berkas Bab ${selectedBab} v${resData.bimbingan.version}. Email pemberitahuan telah dikirim ke Dosen.`);
          setCatatan('');
          setFileObject(null);
          setUploadOpen(false);
          fetchProgress(); // Reload logs
        } catch (postErr: any) {
          setErrorMessage(postErr.message);
        } finally {
          setUploading(false);
        }
      };

      reader.onerror = () => {
        setErrorMessage('Gagal memproses draf berkas.');
        setUploading(false);
      };

      reader.readAsDataURL(fileObject);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi gangguan pengunggahan.');
      setUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center space-x-2 text-blue-900 mb-1">
            <BookOpen className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Dashboard Mahasiswa</span>
          </div>
          <h1 className="text-2xl font-display font-extrabold text-slate-900">{user.name}</h1>
          <p className="text-sm text-slate-500 mt-0.5">NIM: {mahasiswaInfo.nim} &bull; Tugas Akhir / Skripsi</p>
          <div className="mt-3 inline-flex items-center space-x-2 bg-blue-50 text-blue-800 text-xs font-medium px-3 py-1.5 rounded-lg border border-blue-100">
            <User className="h-3.5 w-3.5" />
            <span>Pembimbing: <strong className="font-semibold">{dosen?.name || 'Belum Ditentukan'}</strong></span>
          </div>
        </div>

        <div className="w-full md:w-64 bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-center">
          <div className="flex justify-between text-xs text-slate-500 font-bold mb-1">
            <span>PROGRES SKRIPSI</span>
            <span className="text-blue-800">{getOverallProgress()}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-800 h-full rounded-full transition-all duration-500" 
              style={{ width: `${getOverallProgress()}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-slate-400 text-right mt-1.5">7 Bab Laporan Utama</span>
        </div>
      </div>

      {/* JADWAL SIDANG ALERT SCREEN */}
      {studentDetail.tanggal_sidang ? (
        <div id="alert-sidang-scheduled" className="mb-8 p-6 bg-gradient-to-br from-indigo-900 to-blue-800 text-white rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10 font-sans">
            <div className="flex items-start space-x-3.5">
              <div className="p-3 bg-white/10 rounded-xl shrink-0">
                <Calendar className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-300">Pemberitahuan Resmi</span>
                <h3 className="text-lg font-display font-bold mt-0.5">Jadwal Sidang Skripsi Anda Telah Ditetapkan!</h3>
                <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                  Bapak/Ibu Dosen Pembimbing telah menetapkan jadwal sidang formal Anda. Harap persiapkan draf laporan lengkap dan presentasi PowerPoint terbaik Anda.
                </p>
              </div>
            </div>
            
            <div className="bg-slate-950/40 backdrop-blur-sm p-4 rounded-xl border border-white/15 min-w-[280px]">
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                <span className="text-blue-200">Hari, Tanggal:</span>
                <span className="font-bold text-white">
                  {new Date(studentDetail.tanggal_sidang).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                
                <span className="text-blue-200">Waktu Sidang:</span>
                <span className="font-bold text-white font-mono">
                  {new Date(studentDetail.tanggal_sidang).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} WIB
                </span>
                
                <span className="text-blue-200">Tempat Sidang:</span>
                <span className="font-bold text-emerald-300">
                  {studentDetail.tempat_sidang}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-4 bg-amber-50/70 border border-amber-200/60 rounded-2xl flex items-start space-x-3.5">
          <Clock className="h-5 w-5 text-amber-600 mt-1 shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-slate-900 mb-0.5">Kapan Jadwal Sidang Skripsi Muncul?</p>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Jadwal Sidang Skripsi akan otomatis muncul secara resmi di bagian atas halaman koordinasi ini <strong>segera setelah Dosen Pembimbing Anda menjadwalkannya</strong> melalui form bimbingan dosen. Pastikan kemajuan draf Bab 1 sampai Bab 7 laporan Anda berjalan lancar agar dosen pembimbing dapat merekomendasikan sidang ujian tepat waktu!
            </p>
          </div>
        </div>
      )}

      {/* Notifications / Feedback States */}
      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl flex items-start space-x-3 shadow-sm animate-fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-800 font-medium">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl flex items-start space-x-3 shadow-sm">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Main Panel Division */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Progress horizontal & chapter control (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-display font-bold text-slate-900">Kemajuan Struktur Laporan (Bab 1–7)</h2>
              <button
                id="btn-trigger-upload-modal"
                onClick={() => setUploadOpen(!uploadOpen)}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white bg-blue-800 hover:bg-blue-900 px-3.5 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-blue-800/10 transition-all"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Revisi</span>
              </button>
            </div>

            {/* Upload form container */}
            {uploadOpen && (
              <form onSubmit={handleUploadSubmit} className="mb-8 p-5 bg-slate-50 rounded-xl border border-blue-100 relative animate-slide-down">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-1.5">
                  <Upload className="h-4 w-4 text-blue-800" />
                  <span>Form Pengajuan & Upload Revisi Baru</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Sasaran Bab Laporan</label>
                    <select
                      id="select-upload-bab"
                      value={selectedBab}
                      onChange={(e) => setSelectedBab(parseInt(e.target.value))}
                      className="block w-full bg-white px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-800 focus:border-blue-800"
                    >
                      {babList.map((bab) => {
                        const statusObj = getBabStatus(bab.num);
                        const appendVer = statusObj.record ? ` (v${statusObj.record.version} ${statusObj.badge})` : ' (Baru)';
                        return (
                          <option key={bab.num} value={bab.num}>
                            {bab.title} {appendVer}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">File Dokumen (PDF, DOCX - Max 10MB)</label>
                    <input
                      id="file-upload-input"
                      type="file"
                      accept=".pdf,.docx,.doc"
                      onChange={handleFileChange}
                      className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-800 hover:file:bg-blue-100 cursor-pointer"
                    />
                    {fileObject && (
                      <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                        Ukuran: {(fileObject.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Pesan atau Catatan Tambahan (Opsional)</label>
                  <textarea
                    id="catatan-upload"
                    rows={2}
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Contoh: Sudah memperbaiki metodologi sampling sesuai arahan..."
                    className="block w-full bg-white p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-800"
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                        setUploadOpen(false);
                        setErrorMessage(null);
                    }}
                    className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    id="btn-upload-submit"
                    type="submit"
                    disabled={uploading}
                    className="px-4 py-2 text-white bg-blue-800 hover:bg-blue-900 text-xs font-semibold rounded-lg cursor-pointer disabled:opacity-50"
                  >
                    {uploading ? 'Sedang Mengunggah...' : 'Kirim Pengajuan'}
                  </button>
                </div>
              </form>
            )}

            {/* List Bab Horizontal Grid */}
            <div className="space-y-4">
              {babList.map((bab) => {
                const info = getBabStatus(bab.num);
                return (
                  <div key={bab.num} className="border border-slate-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-200/80 hover:bg-slate-50/40 transition-all">
                    <div className="flex items-start space-x-3">
                      <div className={`mt-0.5 p-2 rounded-lg ${
                        info.status === 'disetujui' ? 'bg-emerald-50 text-emerald-600' :
                        info.status === 'perlu_revisi' ? 'bg-rose-50 text-rose-600' :
                        info.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                        'bg-slate-50 text-slate-400'
                      }`}>
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{bab.title}</h4>
                        {info.record ? (
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 mt-1">
                            <span className="font-mono bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded text-[10px]">v{info.record.version}</span>
                            <span>&bull;</span>
                            <span className="truncate max-w-xs">{info.record.file_name}</span>
                            <span>&bull;</span>
                            <span>{new Date(info.record.created_at).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 mt-1 block">Belum ada dokumen yang diajukan</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${info.color}`}>
                        {info.badge}
                      </span>
                      {info.record && (
                        <a 
                          href={info.record.file_path} 
                          download
                          target="_blank" 
                          referrerPolicy="no-referrer"
                          className="p-2 text-slate-500 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
                          title="Unduh Berkas Ini"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Logbook bimbingan panel */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar className="h-5 w-5 text-blue-900" />
              <h2 className="text-lg font-display font-bold text-slate-900">Histori & Logbook Bimbingan</h2>
            </div>
            {bimbingans.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                Belum ada berkas bimbingan yang tercatat dalam logbook.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-slate-500">
                  <thead className="text-xs font-bold uppercase text-slate-400 bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th scope="col" className="px-4 py-3">Tanggal</th>
                      <th scope="col" className="px-4 py-3">Bab</th>
                      <th scope="col" className="px-4 py-3">Versi</th>
                      <th scope="col" className="px-4 py-3">Catatan Mahasiswa</th>
                      <th scope="col" className="px-4 py-3">Arahan Pembimbing</th>
                      <th scope="col" className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bimbingans.map((bim) => (
                      <tr key={bim.id} className="hover:bg-slate-50/50 transition-all">
                        <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-600 font-medium">
                          {new Date(bim.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-xs font-bold text-slate-700">
                          Bab {bim.bab}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="font-mono bg-slate-100 text-slate-700 font-semibold px-1.5 py-0.5 rounded text-[10px]">v{bim.version}</span>
                        </td>
                        <td className="px-4 py-3.5 text-xs max-w-xs truncate" title={bim.catatan_mahasiswa}>
                          {bim.catatan_mahasiswa || '-'}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-700 font-medium max-w-xs whitespace-pre-wrap">
                          {bim.komentar ? (
                            <span className="text-blue-950 font-medium bg-blue-50/60 p-1.5 rounded block">{bim.komentar}</span>
                          ) : (
                            <span className="text-slate-400 italic">Belum ditinjau</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            bim.status === 'disetujui' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            bim.status === 'perlu_revisi' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                            'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {bim.status === 'disetujui' ? 'Disetujui' : bim.status === 'perlu_revisi' ? 'Revisi' : 'Eksaminasi'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar notes, comments panel (1 Col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-md font-display font-bold text-slate-900 mb-4">Catatan & Komentar Terbaru</h3>
            
            {bimbingans.filter(b => b.komentar).length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs text-slate-500">
                Belum ada feedback / komentar masuk dari Dosen Pembimbing.
              </div>
            ) : (
              <div className="space-y-4">
                {bimbingans
                  .filter(b => b.komentar)
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .slice(0, 4)
                  .map((bim) => (
                    <div key={bim.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-blue-950">Bab {bim.bab} &bull; v{bim.version}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          bim.status === 'disetujui' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {bim.status === 'disetujui' ? 'Lulus' : 'Revisi'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-serif italic">
                        "{bim.komentar}"
                      </p>
                      <div className="text-[10px] text-slate-400 text-right font-medium">
                        Oleh Dr. Budi Santoso &bull; {new Date(bim.created_at).toLocaleDateString()}
                      </div>
                    </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10"></div>
            <h3 className="text-sm font-semibold tracking-wider uppercase opacity-80 mb-1">Materi Pendukung & Alur</h3>
            <h4 className="text-lg font-display font-bold mb-3">SiMon-S Information Handout</h4>
            <p className="text-xs text-slate-200 leading-relaxed mb-4">
              Pastikan file yang diunggah dikoordinasikan terlebih dahulu lewat forum tatap muka bimbingan. Format penamaan dokumen dianjurkan memakai format baku, contohnya: <code className="bg-white/10 px-1 py-0.5 rounded">NIM_BAB_VERSI.pdf</code>.
            </p>
            <div className="space-y-2 text-xs font-medium text-slate-200">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Validasi Ukuran: Maksimal 10 MB per file.</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Format Didukung: PDF, DOCX, DOC.</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
