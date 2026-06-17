import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, Clock, AlertCircle, CheckCircle2, MessageSquare, 
  Download, Calendar, Plus, Share2, ClipboardList, RefreshCw,
  ZoomIn, ZoomOut, X, File, Maximize2, FileText
} from 'lucide-react';
import { Bimbingan, Mahasiswa, Dosen } from '../types';
import { WordViewer } from './WordViewer';

interface DosenDashboardProps {
  user: any;
  dosenInfo: Dosen;
  onLogout: () => void;
}

function getSimulatedDocumentText(title: string, bab: number, studentName: string, nim: string) {
  const cleanTitle = title || "Formulasi Strategi Sistem Informasi";
  switch(bab) {
    case 1:
      return `
# BAB I: PENDAHULUAN

## 1.1 Latar Belakang Masalah
Perkembangan teknologi informasi dan komunikasi (TIK) pada era digital saat ini telah menyentuh hampir seluruh aspek operasional institusi pendidikan. Salah satu tantangan utama yang dihadapi adalah bagaimana memonitoring progres bimbingan akademik secara transparan dan akuntabel. Penelitian dengan judul "${cleanTitle}" oleh ${studentName} (${nim}) diinisiasi untuk mengatasi kesenjangan koordinasi tersebut.

Melalui sistem monitoring terintegrasi ini, proses bimbingan Tugas Akhir / Skripsi dapat dipantau secara real-time oleh Program Studi maupun Dosen Pembimbing. Hal ini mengurangi risiko kelambatan kelulusan akademik mahasiswa dan meningkatkan indeks efisiensi administrasi.

## 1.2 Rumusan Masalah
Berdasarkan latar belakang yang dipaparkan, rumusan masalah dalam penelitian ini adalah:
1. Bagaimana merancang arsitektur sistem monitoring progres skripsi yang aman dan adaptif?
2. Bagaimana mengimplementasikan kontrol versi dokumen otomatis untuk memfasilitasi pelacakan feedback?

## 1.3 Tujuan Penelitian
Tujuan utama yang ingin dicapai melalui pengerjaan skripsi ini adalah:
1. Menghasilkan sistem aplikasi SiMon-S dengan platform berbasis web.
2. Memfasilitasi integrasi data bimbingan secara real-time demi efisiensi bimbingan akademik.
3. Menguji efektivitas sistem terhadap respon waktu feedback dosen pembimbing.
      `;
    case 2:
      return `
# BAB II: TINJAUAN PUSTAKA

## 2.1 State of the Art (Penelitian Terdahulu)
Dalam bab literatur ini, dipaparkan berbagai dasar teori pendukung penelitian "${cleanTitle}". Berbagai studi sejenis mengenai Sistem Informasi Monitoring Akademik telah dievaluasi:
1. Pratama et al. (2023) menerapkan arsitektur MVC konvensional untuk merekam logbook mahasiswa, namun sistem tersebut belum mendukung live preview dokumen ataupun email alert.
2. Lestari & Wijaya (2024) meneliti sistem manajemen usulan bab skripsi desentralistik, namun memiliki kelemahan pada pembagian peran akses pengguna (RBAC) yang longgar.

## 2.2 Landasan Teori Utama
Penelitian ini didasarkan atas teori rekayasa perangkat lunak modern (agile software development) dan teori basis data relasional. 
- **Sistem Informasi Manajemen:** Sekumpulan komponen yang saling berhubungan untuk mengumpulkan, memproses, menyimpan, dan mendistribusikan informasi guna mendukung pengambilan keputusan.
- **RESTful API:** Arsitektur transfer data berbasis HTTP yang menekankan kesederhanaan, skalabilitas, dan keandalan interaksi client-server.
- **Role-Based Access Control (RBAC):** Metode penegakan keamanan sistem dengan membatasi akses ke sumber daya berdasarkan tingkat kewenangan peran pengguna yang sah.
      `;
    case 3:
      return `
# BAB III: METODOLOGI PENELITIAN

## 3.1 Alur Penelitian (Research Framework)
Metodologi pengerjaan untuk proyek skripsi "${cleanTitle}" menggunakan model Waterfall yang dimodifikasi secara iteratif. Alur kegiatan dibagi menjadi empat fase utama:
1. **Analisis Kebutuhan (Requirements Gathering):** Wawancara terstruktur dengan kaprodi dan dosen pembimbing di lingkungan Fakultas.
2. **Perancangan Sistem (System Design):** Penyusunan diagram relasi entitas (ERD), diagram kasus penggunaan (Use Case), dan mockup antarmuka.
3. **Pengodean (Coding/Implementation):** Implementasi kode menggunakan TypeScript, Express, dan React.
4. **Pengujian (Testing):** Menjalankan pengujian fungsionalitas (Blackbox Testing) dan kegunaan (System Usability Scale).

## 3.2 Desain Database & Data Flow
Interaksi entitas membagi pengguna menjadi tiga peran: Mahasiswa, Dosen, dan Admin. Alur pengajuan draf dimulai dari unggahan file format PDF/DOCX oleh mahasiswa, pemicuan logika kontrol versi (version controller), penyimpanan virtual pada filesystem server, hingga notifikasi alert terkirim ke dosen penilai.
      `;
    case 4:
      return `
# BAB IV: ANALISIS DAN PERANCANGAN SISTEM

## 4.1 Analisis Kebutuhan Sistem
Dalam pengembangan aplikasi skripsi "${cleanTitle}", dianalisis dua kategori kebutuhan utama:
- **Kebutuhan Fungsional:**
  1. Mahasiswa harus dapat mengunggah bab laporan (Bab 1-7) dengan validasi ukuran berkas otomatis.
  2. Dosen Pembimbing harus memiliki wewenang untuk meninjau secara inline dan memverifikasi status kemajuan.
  3. Sistem wajib memfasilitasi notifikasi otomatis saat draf berstatus Lulus atau Perlu Revisi.
- **Kebutuhan Non-Fungsional:**
  1. Keamanan data pengguna menggunakan filter otentikasi ketat.
  2. Responsivitas antarmuka optimal di perangkat mobile maupun desktop.

## 4.2 Perancangan Arsitektur Perangkat Lunak
Arsitektur dirancang menggunakan pola decoupled client-server. Lapisan frontend React berkomunikasi dengan Express API backend melalui protokol HTTP/JSON terenkripsi. Kontrol status bimbingan mencatat histori draf secara logis sebagai "Pending", "Perlu Revisi", atau "Disetujui".
      `;
    case 5:
      return `
# BAB V: IMPLEMENTASI SISTEM

## 5.1 Implementasi Antarmuka Pengguna
Komponen antarmuka dikonstruksi memanfaatkan pustaka React didukung utilitarian framework Tailwind CSS. Unit-unit component modular dibuat terpisah guna mencegah token limit dan tumpang tindih state global.
- \`LoginScreen.tsx\` mengontrol pemetaan autentikasi pengguna secara cerdas.
- \`DosenDashboard.tsx\` menyajikan rekap kemajuan bimbingan sekaligus formulir peninjauan berkas draf laporan.
- \`MahasiswaDashboard.tsx\` memfasilitasi form unggah serta log status kemajuan bimbingan.

## 5.2 Implementasi API Server
Endpoint server dideklarasikan pada module \`server.ts\` menggunakan runtime Node.js. Logic penanganan file menangani penguraian Base64 secara asinkron lalu memindahkan biner dokumen ke dalam repositori storage \`/uploads\` dengan skema penamaan file unik berbasis timestamps demi menghindari bentrokan modifikasi file.
      `;
    case 6:
      return `
# BAB VI: HASIL DAN PEMBAHASAN

## 6.1 Hasil Pengujian Fungsional (Black-box Testing)
Pengujian fungsional sistem skripsi "${cleanTitle}" dilakukan dengan skenario uji komprehensif. Seluruh fungsionalitas utama seperti Login Multiperan, Validasi Berkas, Review Pembimbing, dan Penjadwalan Sidang menunjukkan tingkat keberhasilan 100% (Passed).

## 6.2 Hasil Evaluasi Kegunaan (System Usability Scale)
Sistem diujicobakan kepada 15 Responden Mahasiswa dan 5 Responden Dosen di program studi. Hasil analisis kuesioner SUS memperlihatkan skor rata-rata kemudahan kegunaan berada pada angka **84.5** (kategori *Excellent/Acceptable*), membuktikan antarmuka SiMon-S sangat intuitif dan mudah dipahami sekalipun oleh pengguna awam.
      `;
    case 7:
      return `
# BAB VII: PENUTUP DAN SARAN

## 7.1 Kesimpulan
Berdasarkan hasil perancangan, implementasi, dan pengujian yang telah dipaparkan pada bab-bab sebelumnya mengenai "${cleanTitle}", ditarik kesimpulan:
1. Aplikasi SiMon-S berhasil diimplementasikan penuh sebagai solusi digital monitoring tugas akhir desentralistik yang dinamis.
2. Fitur kontrol versi dan alert email simulated membantu mempercepat siklus koreksi revisi antara mahasiswa dan dosen bimbingan.
3. Review berkas langsung pada sistem terbukti memangkas waktu kerja dosen karena mengeliminasi aktivitas pengunduhan manual draf.

## 7.2 Saran Pengembangan
Beberapa poin saran bagi pengembangan riset ke depan antara lain:
1. Mengintegrasikan mesin pemeriksa plagiarisme otomatis (Plagiarism Checker) dalam sistem peninjauan dokumen skripsi.
2. Menambahkan editor teks kaya kolaboratif (Collaborative Live Document Editor) langsung pada halaman bimbingan.
      `;
    default:
      return `Draf laporan lengkap skripsi dalam pemeriksaan sistem.`;
  }
}

export default function DosenDashboard({ user, dosenInfo, onLogout }: DosenDashboardProps) {
  const [students, setStudents] = useState<Mahasiswa[]>([]);
  const [bimbingans, setBimbingans] = useState<Bimbingan[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Mahasiswa | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Active Review State
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
  const [reviewComment, setReviewComment] = useState('');

  // Document Viewer & Reviewer States
  const [previewBimbingan, setPreviewBimbingan] = useState<Bimbingan | null>(null);
  const [previewZoom, setPreviewZoom] = useState<number>(100);
  const [previewTab, setPreviewTab] = useState<'parsed' | 'embed'>('embed');

  // Sidang Scheduler State
  const [schedulerOpen, setSchedulerOpen] = useState(false);
  const [scheduleTargetStudentId, setScheduleTargetStudentId] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleRoom, setScheduleRoom] = useState('');
  const [scheduling, setScheduling] = useState(false);

  const fetchDosenData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dosen/bimbingan', {
        headers: { 'x-user-id': user.id },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal memuat data bimbingan dosen.');
      }
      setStudents(data.students || []);
      setBimbingans(data.bimbingans || []);
      
      // Auto select first student if none selected
      if (data.students && data.students.length > 0 && !selectedStudent) {
        setSelectedStudent(data.students[0]);
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDosenData();
  }, [user.id]);

  const handleReviewSubmit = async (status: 'disetujui' | 'perlu_revisi') => {
    if (!activeReviewId) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!reviewComment.trim() && status === 'perlu_revisi') {
      setErrorMessage('Komentar arahan bimbingan wajib diisi jika Anda meminta revisi.');
      return;
    }

    try {
      const response = await fetch('/api/dosen/review', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          bimbingan_id: activeReviewId,
          status,
          komentar: reviewComment
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Gagal mempublikasikan hasil peninjauan.');
      }

      setSuccessMessage(`Berhasil memverifikasi dokumen bimbingan dengan status: ${status.toUpperCase()}. Sistem telah mengirim email notifikasi ke mahasiswa.`);
      setReviewComment('');
      setActiveReviewId(null);
      fetchDosenData();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  const handleCreateSidang = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!scheduleTargetStudentId || !scheduleDate || !scheduleRoom) {
      setErrorMessage('Semua field penjadwalan sidang wajib diisi.');
      return;
    }

    setScheduling(true);
    try {
      const response = await fetch('/api/sidang/schedule', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          mahasiswa_id: scheduleTargetStudentId,
          tanggal_sidang: scheduleDate,
          tempat_sidang: scheduleRoom
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Gagal menjadwalkan sidang.');
      }

      setSuccessMessage('Sukses menjadwalkan Sidang Skripsi. Mahasiswa terkait telah menerima rincian acara lewat email.');
      setScheduleDate('');
      setScheduleRoom('');
      setScheduleTargetStudentId('');
      setSchedulerOpen(false);
      fetchDosenData();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setScheduling(false);
    }
  };

  const handleModalReviewSubmit = async (status: 'disetujui' | 'perlu_revisi', modalComment: string, bimbinganId: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!modalComment.trim() && status === 'perlu_revisi') {
      alert('Komentar arahan bimbingan wajib diisi jika Anda meminta revisi.');
      return;
    }

    try {
      const response = await fetch('/api/dosen/review', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({
          bimbingan_id: bimbinganId,
          status,
          komentar: modalComment
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Gagal mempublikasikan hasil peninjauan.');
      }

      setSuccessMessage(`Berhasil memverifikasi berkas Bab ${previewBimbingan?.bab} dengan status: ${status.toUpperCase()}. Mahasiswa telah memperoleh email simulasi.`);
      setReviewComment('');
      setPreviewBimbingan(null); // Close modal
      fetchDosenData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Get student's overall progress (percentage) based on how many among Ch 1-7 are approved
  const getStudentProgressPercent = (studentId: string) => {
    const studentBim = bimbingans.filter(b => b.mahasiswa_id === studentId);
    let approved = 0;
    for (let chapter = 1; chapter <= 7; chapter++) {
      const chBim = studentBim.filter(b => b.bab === chapter);
      if (chBim.length > 0) {
        // Find latest
        const latest = [...chBim].sort((a,b) => b.version - a.version)[0];
        if (latest.status === 'disetujui') {
          approved++;
        }
      }
    }
    return Math.round((approved / 7) * 100);
  };

  const pendingSubmissions = bimbingans.filter(b => b.status === 'pending');
  const studentBimbingans = selectedStudent 
    ? bimbingans.filter(b => b.mahasiswa_id === selectedStudent.id)
    : [];

  const renderPreviewModal = () => {
    if (!previewBimbingan) return null;
    const student = students.find(s => s.id === previewBimbingan.mahasiswa_id);
    const docText = getSimulatedDocumentText(
      student?.judul_skripsi || "", 
      previewBimbingan.bab, 
      student?.name || "Mahasiswa", 
      student?.nim || "12345678"
    );

    const fileNameLower = previewBimbingan.file_name.toLowerCase();
    const filePathLower = previewBimbingan.file_path.toLowerCase();
    
    const isWordFile = fileNameLower.endsWith('.docx') || 
                       fileNameLower.endsWith('.doc') ||
                       previewBimbingan.file_path.startsWith('data:application/vnd.openxmlformats') ||
                       previewBimbingan.file_path.startsWith('data:application/msword') ||
                       (previewBimbingan.file_path.startsWith('data:') && (
                         fileNameLower.endsWith('.docx') ||
                         fileNameLower.endsWith('.doc')
                       ));

    return (
      <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-0 md:p-6 transition-all duration-300">
        <div className="bg-slate-900 border border-slate-850 w-full max-w-7xl h-full md:h-[90vh] rounded-none md:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-900/40 rounded-xl border border-indigo-700/30 text-indigo-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-extrabold font-mono uppercase">
                    Bab {previewBimbingan.bab}
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold">
                    Versi {previewBimbingan.version}
                  </span>
                </div>
                <h2 className="text-xs font-bold text-slate-200 mt-0.5">Peninjauan draf: {previewBimbingan.file_name}</h2>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPreviewBimbingan(null)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Side by side layout */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-950">
            
            {/* Left Side: Interactive Document Reader (65% width) */}
            <div className="flex-1 min-h-[50vh] md:h-full md:w-[65%] flex flex-col border-r border-slate-800 bg-slate-900">
              
              {/* Reader toolbar control */}
              <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPreviewTab('embed')}
                    className={`text-[11px] px-3 py-1.5 rounded-lg font-bold transition-all transition-colors cursor-pointer ${
                      previewTab === 'embed' 
                        ? 'bg-indigo-600 text-white shadow' 
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    🖥️ Dokumen Asli Mahasiswa
                  </button>
                  <button
                    onClick={() => setPreviewTab('parsed')}
                    className={`text-[11px] px-3 py-1.5 rounded-lg font-bold transition-all transition-colors cursor-pointer ${
                      previewTab === 'parsed' 
                        ? 'bg-indigo-600 text-white shadow' 
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    📖 Transkrip Teks Sistem
                  </button>
                </div>

                {(previewTab === 'parsed' || (previewTab === 'embed' && isWordFile)) && (
                  <div className="flex items-center space-x-2 text-slate-400">
                    <button
                      onClick={() => setPreviewZoom(Math.max(80, previewZoom - 10))}
                      className="p-1 hover:bg-slate-800 rounded text-slate-300 cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </button>
                    <span className="text-[10px] font-mono font-bold bg-slate-900 px-2 py-1 rounded text-white">{previewZoom}%</span>
                    <button
                      onClick={() => setPreviewZoom(Math.min(200, previewZoom + 10))}
                      className="p-1 hover:bg-slate-800 rounded text-slate-300 cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Document Body Viewport */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 flex justify-center bg-slate-950 relative min-h-[450px]">
                {previewTab === 'parsed' ? (
                  <div 
                    style={{ fontSize: `${previewZoom}%` }}
                    className="bg-white text-slate-800 p-8 max-w-2xl w-full rounded-2xl shadow-xl font-serif space-y-6 overflow-hidden border border-slate-200 transition-all duration-150 leading-relaxed text-xs self-start"
                  >
                    {/* Cover details watermark */}
                    <div className="border-b border-dashed border-slate-200 pb-4 mb-4 text-center text-[10px] font-sans text-slate-400 font-mono tracking-wide">
                      DIREVISI SECARA INTEGRAL &bull; UNIVERSITAS SIMON-S &bull; VERSI {previewBimbingan.version}
                    </div>

                    {/* Formatting simulation */}
                    <div className="whitespace-pre-wrap select-text markdown-body">
                      {docText.trim()}
                    </div>

                    <div className="border-t border-dashed border-slate-150 pt-6 mt-8 flex justify-between items-center text-[9px] font-sans text-slate-400">
                      <span>SISTEM MONITORING SIMON-S v2.3</span>
                      <span>Halaman Utama</span>
                    </div>
                  </div>
                ) : (() => {
                  const isPdf = fileNameLower.endsWith('.pdf') || 
                                filePathLower.endsWith('.pdf') || 
                                previewBimbingan.file_path.startsWith('data:application/pdf');
                                
                  const isWord = isWordFile;

                  if (isWord) {
                    return (
                      <div className="w-full h-full min-h-[550px] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                        {/* Interactive tips bar */}
                        <div className="bg-slate-950 text-indigo-350 text-[10px] sm:text-xs px-4 py-2 bg-gradient-to-r from-slate-950 to-indigo-950 border-b border-slate-800 flex items-center justify-between shrink-0">
                          <span className="flex items-center space-x-1.5 font-medium">
                            <span className="inline-block w-2 bg-indigo-500 h-2 rounded-full animate-pulse"></span>
                            <span>Menampilkan Dokumen Word Asli (.docx)</span>
                          </span>
                          <span className="text-slate-500 text-[10px] hidden sm:inline">Gulir atau geser area dokumen di bawah untuk membaca lengkap</span>
                        </div>

                        {/* Actual Word Reader using Docx Preview */}
                        <div className="flex-1 w-full h-[500px] overflow-hidden bg-slate-950 relative">
                          <WordViewer filePath={previewBimbingan.file_path} zoom={previewZoom} />
                        </div>

                        {/* Interactive Footer */}
                        <div className="bg-slate-950 p-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs font-sans">
                          <div className="flex items-center space-x-2 text-slate-350 min-w-0">
                            <File className="h-4 w-4 text-indigo-400 shrink-0" />
                            <span className="truncate font-medium text-slate-350 text-[11px]">{previewBimbingan.file_name}</span>
                          </div>
                          <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0 justify-end">
                            <button
                              onClick={() => setPreviewTab('parsed')}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg transition-all text-[11px] font-bold cursor-pointer"
                            >
                              Transkrip Teks 📖
                            </button>
                            <a 
                              href={previewBimbingan.file_path}
                              download={previewBimbingan.file_name}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all text-[11px] font-bold text-center flex-1 sm:flex-none cursor-pointer"
                            >
                              Unduh Word ⬇
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (isPdf) {
                    return (
                      <div className="w-full h-full min-h-[550px] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                        {/* Interactive tips bar to guide users */}
                        <div className="bg-slate-950 text-indigo-300 text-[10px] sm:text-xs px-4 py-2 bg-gradient-to-r from-slate-950 to-indigo-950 border-b border-slate-800 flex items-center justify-between shrink-0">
                          <span className="flex items-center space-x-1.5 font-medium">
                            <span className="inline-block w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                            <span>Menampilkan Dokumen Asli Mahasiswa (.pdf)</span>
                          </span>
                          <span className="text-slate-500 text-[10px] hidden sm:inline">Gulir atau seret area untuk membaca</span>
                        </div>

                        {/* Actual PDF Iframe with perfect size */}
                        <div className="flex-1 w-full h-full min-h-[450px] relative bg-slate-950 overflow-hidden">
                          <iframe 
                            src={previewBimbingan.file_path} 
                            className="absolute inset-0 w-full h-full border-none"
                            scrolling="yes"
                            title="Real PDF Viewer"
                          />
                        </div>

                        {/* Interactive Footer banner */}
                        <div className="bg-slate-950 p-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs font-sans">
                          <div className="flex items-center space-x-2 text-slate-350 min-w-0">
                            <File className="h-4 w-4 text-emerald-400 shrink-0" />
                            <span className="truncate font-medium text-slate-350 text-[11px]">{previewBimbingan.file_name}</span>
                          </div>
                          <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0 justify-end">
                            <a 
                              href={previewBimbingan.file_path}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg transition-all text-[11px] font-bold text-center flex-1 sm:flex-none cursor-pointer"
                            >
                              Buka Tab Baru ↗
                            </a>
                            <a 
                              href={previewBimbingan.file_path}
                              download={previewBimbingan.file_name}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all text-[11px] font-bold text-center flex-1 sm:flex-none cursor-pointer"
                            >
                              Unduh PDF ⬇
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Default Fallback
                  return (
                    <div className="w-full h-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-center items-center text-center p-6 my-auto self-start">
                      <FileText className="h-12 w-12 text-indigo-500 mb-2" />
                      <h3 className="text-white text-sm font-bold">Dokumen Berhasil Terbuka Secara Internal</h3>
                      <p className="text-slate-400 text-xs mt-1 max-w-sm">
                        Berkas bimbingan ({previewBimbingan.file_name}) telah termuat secara asinkron. Silakan lihat meluncur ke tab <strong>"📖 Transkrip Teks Sistem"</strong> atau klik tombol unduh untuk melihat draf bimbingan.
                      </p>
                      <a 
                        href={previewBimbingan.file_path}
                        download={previewBimbingan.file_name}
                        className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl"
                      >
                        Unduh File
                      </a>
                    </div>
                  );
                })()}
              </div>

            </div>

            {/* Right Side: Evaluation Form (35% width) */}
            <div id="evaluasi-panel" className="md:w-[35%] flex flex-col bg-slate-900 border-t md:border-t-0 border-slate-800 overflow-y-auto p-6 font-sans">
              
              {/* Student profile */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 mb-6">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block mb-1">Identitas Mahasiswa</span>
                <h3 className="text-sm font-bold text-white mb-0.5">{student?.name || "Nama Mahasiswa"}</h3>
                <code className="text-xs text-indigo-400 font-mono">NIM {student?.nim || "12345678"}</code>
                
                <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs space-y-1.5 text-slate-300">
                  <p><span className="text-slate-500">Judul Skripsi:</span> <br/><strong className="italic text-white">"{student?.judul_skripsi}"</strong></p>
                  <p className="pt-1.5"><span className="text-slate-500">Catatan Mahasiswa:</span> <br/>
                    <span className="text-slate-400 bg-slate-900 p-2 rounded block mt-1 border border-slate-850">
                      {previewBimbingan.catatan_mahasiswa || <span className="text-slate-500">Tidak ada catatan</span>}
                    </span>
                  </p>
                </div>
              </div>

              {/* Submission detail */}
              <div className="mb-6">
                <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block mb-2">Evaluasi Hasil Kelayakan</span>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl">
                    <span className="text-slate-500 text-[10px] uppercase block">Pemeriksaan</span>
                    <span className="font-bold text-white">Bab {previewBimbingan.bab}</span>
                  </div>
                  <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl col-span-1">
                    <span className="text-slate-500 text-[10px] uppercase block">Draf File</span>
                    <span className="font-bold text-indigo-400 truncate block mt-0.5" title={previewBimbingan.file_name}>{previewBimbingan.file_name}</span>
                  </div>
                </div>
              </div>

              {/* Comments input */}
              <div className="flex-1 flex flex-col space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Arahkan Catatan & Perbaikan Akademik</label>
                <textarea
                  id="modal-textarea-comment"
                  rows={5}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Masukkan koreksi, arahan revisi, atau catatan apresiasi persetujuan Anda..."
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3.5 text-xs text-white outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 flex-1 resize-none font-sans"
                ></textarea>
                
                <p className="text-[10px] text-slate-500 italic leading-relaxed pt-1">
                  Catatan ini akan langsung tersimpan di logbook bimbingan dan menyinkronkan status draf.
                </p>
              </div>

              {/* Form Submission buttons */}
              <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handleModalReviewSubmit('perlu_revisi', reviewComment, previewBimbingan.id)}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center space-x-1"
                >
                  <span>Revisi Masukan</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleModalReviewSubmit('disetujui', reviewComment, previewBimbingan.id)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center space-x-1"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-white/90" />
                  <span>Setujui Bab</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Header Profile */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center space-x-2 text-indigo-900 mb-1">
            <Users className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Dashboard Dosen Pembimbing</span>
          </div>
          <h1 className="text-2xl font-display font-extrabold text-slate-900">{user.name}</h1>
          <p className="text-sm text-slate-500 mt-0.5">NIDN: {dosenInfo.nidn} &bull; Fakultas Teknologi Informasi</p>
        </div>

        <div className="flex gap-2 shrink-0 w-full md:w-auto">
          <button
            id="btn-open-scheduler"
            onClick={() => setSchedulerOpen(!schedulerOpen)}
            className="w-full md:w-auto inline-flex items-center justify-center space-x-1.5 bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-blue-800/10 transition-all"
          >
            <Calendar className="h-4 w-4" />
            <span>Jadwalkan Sidang</span>
          </button>
          
          <button
            onClick={fetchDosenData}
            title="Muat ulang data"
            className="p-2.5 text-slate-500 hover:text-indigo-900 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/50 rounded-xl cursor-pointer transition-all"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Notifications banner */}
      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl flex items-start space-x-3 shadow-sm">
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

      {/* Sidang scheduling Modal/Card block */}
      {schedulerOpen && (
        <div className="mb-8 p-6 bg-gradient-to-br from-indigo-900 to-slate-950 text-white rounded-2xl border border-indigo-950 shadow-xl relative animate-slide-down">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-6 -mt-6"></div>
          <h2 className="text-lg font-display font-bold mb-4 flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-indigo-300" />
            <span>Form Penjadwalan Sidang Skripsi / Ujian</span>
          </h2>
          <form onSubmit={handleCreateSidang} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">Pilih Mahasiswa</label>
              <select
                id="select-sidang-mhs"
                value={scheduleTargetStudentId}
                onChange={(e) => setScheduleTargetStudentId(e.target.value)}
                className="block w-full bg-slate-800 border border-slate-700 rounded-lg text-xs p-2 text-white outline-none focus:border-indigo-400"
              >
                <option value="">-- Pilih Mahasiswa --</option>
                {students.map((st) => (
                  <option key={st.id} value={st.id}>{st.name} ({st.nim})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">Tanggal & Waktu Ujian</label>
              <input
                id="sidang-date-input"
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="block w-full bg-slate-800 border border-slate-700 rounded-lg text-xs p-2 text-white outline-none focus:border-indigo-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase">Lokasi / Ruang Sidang</label>
              <input
                id="sidang-room-input"
                type="text"
                placeholder="cth: Ruang Sidang Utama Gd. C Lantai 4"
                value={scheduleRoom}
                onChange={(e) => setScheduleRoom(e.target.value)}
                className="block w-full bg-slate-800 border border-slate-700 rounded-lg text-xs p-2 text-white outline-none focus:border-indigo-400"
              />
            </div>

            <div className="md:col-span-3 flex justify-end space-x-2 mt-4">
              <button
                type="button"
                onClick={() => setSchedulerOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                id="btn-sidang-submit"
                type="submit"
                disabled={scheduling}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded-lg text-white cursor-pointer disabled:opacity-55"
              >
                {scheduling ? 'Mengirim Jadwal...' : 'Simpan & Jadwalkan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid: Pending actions (Requires Dosen Review) */}
      {pendingSubmissions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-bold text-rose-700 flex items-center space-x-1.5 mb-4 uppercase tracking-wider">
            <AlertCircle className="h-4.5 w-4.5 text-rose-500 shrink-0" />
            <span>Perlu Peninjauan Segera ({pendingSubmissions.length})</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingSubmissions.map((bim) => {
              const mStudent = students.find(s => s.id === bim.mahasiswa_id);
              const isSelectedReview = activeReviewId === bim.id;

              return (
                <div key={bim.id} className="bg-white border-2 border-amber-300 rounded-2xl p-5 shadow-sm space-y-3 hover:shadow-md transition-all relative">
                  <div className="absolute top-4 right-4 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Belum Ditinjau
                  </div>

                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Mahasiswa</span>
                    <h3 className="text-sm font-bold text-slate-900">{mStudent?.name || 'Mahasiswa'}</h3>
                    <code className="text-[10px] text-slate-500 font-mono">NIM: {mStudent?.nim}</code>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Submisi Dokumen</span>
                    <h4 className="text-xs font-semibold text-indigo-950 mt-0.5">Bab {bim.bab} &bull; Versi {bim.version}</h4>
                    <p className="text-xs text-slate-500 truncate mt-1">File: {bim.file_name}</p>
                    {bim.catatan_mahasiswa && (
                      <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-lg mt-2 font-serif border border-slate-100">
                        "{bim.catatan_mahasiswa}"
                      </p>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setPreviewBimbingan(bim);
                        setPreviewTab('embed');
                        setPreviewZoom(100);
                        setReviewComment(bim.komentar || '');
                      }}
                      className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg cursor-pointer transition-all shrink-0"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Baca di Sistem</span>
                    </button>

                    <a 
                      href={bim.file_path} 
                      download
                      target="_blank" 
                      referrerPolicy="no-referrer"
                      className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-all"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Unduh</span>
                    </a>

                    <button
                      id={`btn-review-${bim.id}`}
                      onClick={() => {
                        setActiveReviewId(isSelectedReview ? null : bim.id);
                        setReviewComment('');
                      }}
                      className="inline-flex items-center space-x-1 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 px-3 py-2 rounded-lg cursor-pointer transition-all"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>{isSelectedReview ? 'Tutup' : 'Tinjau'}</span>
                    </button>
                  </div>

                  {/* Comment Input dropdown / overlay */}
                  {isSelectedReview && (
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-3 bg-amber-50/40 p-3 rounded-xl">
                      <label className="block text-xs font-bold text-slate-700 uppercase">Arahan & Catatan Revisi</label>
                      <textarea
                        id={`textarea-review-${bim.id}`}
                        rows={3}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Silahkan berikan catatan kritik/perbaikan, atau apresiasi jika disetujui..."
                        className="block w-full bg-white p-2.5 text-xs text-slate-800 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-800"
                      ></textarea>
                      
                      <div className="flex justify-end space-x-2">
                        <button
                          id="btn-revisi-lagi"
                          onClick={() => handleReviewSubmit('perlu_revisi')}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded cursor-pointer"
                        >
                          Minta Revisi Lagi
                        </button>
                        <button
                          id="btn-setuju-bab"
                          onClick={() => handleReviewSubmit('disetujui')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded cursor-pointer"
                        >
                          Setujui Bab
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main split: left side student list selector, right side detailed log history */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Supervised students list (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h2 className="text-md font-display font-bold text-slate-900 mb-4 flex items-center space-x-1.5">
            <Users className="h-5 w-5 text-indigo-900" />
            <span>Mahasiswa Bimbingan ({students.length})</span>
          </h2>

          {students.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              Belum ada mahasiswa bimbingan yang terdaftar.
            </div>
          ) : (
            <div className="space-y-3">
              {students.map((st) => {
                const isActive = selectedStudent?.id === st.id;
                const percent = getStudentProgressPercent(st.id);
                
                return (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStudent(st)}
                    className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-start gap-1.5 ${
                      isActive 
                        ? 'border-indigo-700 bg-indigo-50/50 shadow-sm' 
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/40'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="mr-2">
                        <h3 className="text-xs font-bold text-slate-900">{st.name}</h3>
                        <code className="text-[10px] text-slate-400 font-mono">NIM {st.nim}</code>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        percent === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {percent}% Lulus
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-600 font-medium line-clamp-2 italic" title={st.judul_skripsi}>
                      "{st.judul_skripsi}"
                    </p>

                    {st.tanggal_sidang && (
                      <div className="mt-1 flex items-center space-x-1 text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded font-semibold self-start">
                        <Calendar className="h-3 w-3 text-emerald-600" />
                        <span>Sidang: {new Date(st.tanggal_sidang).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</span>
                      </div>
                    )}

                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                      <div 
                        className={`h-full rounded-full ${percent === 100 ? 'bg-emerald-500' : 'bg-indigo-700'}`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected student detail progress track & historical uploads (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {selectedStudent ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="border-b border-slate-100 pb-4 mb-4">
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Mahasiswa Terpilih</span>
                    <h2 className="text-lg font-display font-bold text-indigo-950 mt-0.5">{selectedStudent.name}</h2>
                    <p className="text-xs text-slate-500 font-medium">Judul: "{selectedStudent.judul_skripsi}"</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedStudent.tanggal_sidang && (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 text-center shrink-0">
                        <span className="block text-[9px] font-bold text-emerald-800 uppercase leading-none mb-1">Jadwal Sidang</span>
                        <span className="text-[11px] font-bold text-emerald-950">{new Date(selectedStudent.tanggal_sidang).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}</span>
                      </div>
                    )}
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-2 text-center shrink-0">
                      <span className="block text-[9px] font-bold text-indigo-800 uppercase leading-none">Evaluasi Bab</span>
                      <span className="text-lg font-extrabold text-indigo-950">{getStudentProgressPercent(selectedStudent.id)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status breakdown of Bab 1-7 for THIS specific student */}
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Peta Kemajuan Deskriptif Bab</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 mb-6">
                {[1,2,3,4,5,6,7].map((ch) => {
                  const chBim = studentBimbingans.filter(b => b.bab === ch);
                  let statusColor = 'bg-slate-50 text-slate-400 border-slate-100';
                  let label = 'Belum Ada';

                  if (chBim.length > 0) {
                    const latest = [...chBim].sort((a,b) => b.version - a.version)[0];
                    if (latest.status === 'disetujui') {
                      statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                      label = 'Lulus';
                    } else if (latest.status === 'perlu_revisi') {
                      statusColor = 'bg-rose-50 text-rose-700 border-rose-200';
                      label = 'Revisi';
                    } else {
                      statusColor = 'bg-amber-50 text-amber-700 border-amber-200';
                      label = 'Eksaminasi';
                    }
                  }

                  return (
                    <div key={ch} className={`p-2.5 rounded-lg border text-center flex flex-col justify-center items-center ${statusColor}`}>
                      <span className="text-xs font-bold block">Bab {ch}</span>
                      <span className="text-[9px] font-semibold tracking-tight">{label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Document feed log history */}
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                <ClipboardList className="h-4 w-4" />
                <span>Histori Bimbingan Mahasiswa Ini ({studentBimbingans.length})</span>
              </h3>

              {studentBimbingans.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                  Mahasiswa ini belum mengirimkan berkas pengajuan atau draf laporan draf bimbingan.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs text-left text-slate-500">
                    <thead className="bg-slate-50 border-b border-slate-100 font-bold uppercase text-slate-400">
                      <tr>
                        <th className="px-3 py-2">Waktu Kirim</th>
                        <th className="px-3 py-2">Target Bab</th>
                        <th className="px-3 py-2">Versi</th>
                        <th className="px-3 py-2">Draf Berkas</th>
                        <th className="px-3 py-2">Komentar Terakhir</th>
                        <th className="px-4 py-2 text-right">Aksi Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentBimbingans
                        .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .map((bim) => (
                          <tr key={bim.id} className="hover:bg-slate-50/50 transition-all">
                            <td className="px-3 py-3 whitespace-nowrap text-slate-400 font-medium">
                              {new Date(bim.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-3 py-3 font-semibold text-slate-800">
                              Bab {bim.bab}
                            </td>
                            <td className="px-3 py-3 text-slate-600">
                              <span className="font-mono bg-slate-100 font-bold px-1.5 py-0.5 rounded text-[10px]">v{bim.version}</span>
                            </td>
                            <td className="px-3 py-3 max-w-[120px] truncate" title={bim.file_name}>
                              {bim.file_name}
                            </td>
                            <td className="px-3 py-3 max-w-[150px] truncate italic" title={bim.komentar || 'Belum ditinjau'}>
                              {bim.komentar || <span className="text-slate-300">Belum ada arahan</span>}
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end space-x-2">
                                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                                  bim.status === 'disetujui' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                  bim.status === 'perlu_revisi' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                  'bg-amber-50 text-amber-700 border-amber-100'
                                }`}>
                                  {bim.status === 'disetujui' ? 'Disetujui' : bim.status === 'perlu_revisi' ? 'Revisi' : 'Eksaminasi'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPreviewBimbingan(bim);
                                    setPreviewTab('embed');
                                    setPreviewZoom(100);
                                    setReviewComment(bim.komentar || '');
                                  }}
                                  className="p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded cursor-pointer animate-pulse-subtle"
                                  title="Baca & Review Langsung"
                                >
                                  <Maximize2 className="h-3.5 w-3.5" />
                                </button>
                                <a 
                                  href={bim.file_path} 
                                  download
                                  target="_blank" 
                                  referrerPolicy="no-referrer"
                                  className="p-1.5 text-blue-800 hover:bg-blue-50 rounded"
                                  title="Unduh File"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                </a>
                              </div>
                            </td>
                          </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-center items-center p-8 text-center h-48">
              <Users className="h-8 w-8 text-slate-300 mb-2" />
              <p className="text-slate-400 text-sm">Pilih mahasiswa di menu sebelah kiri untuk melihat rincian progres bimbingan.</p>
            </div>
          )}
        </div>

      </div>

      {renderPreviewModal()}
    </div>
  );
}
