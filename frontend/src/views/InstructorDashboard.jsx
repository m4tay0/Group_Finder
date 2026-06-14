import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Sparkles, Users, Copy, Check,
  BookOpen, XCircle, Timer, Activity,
} from 'lucide-react';
import {
  MOCK_COURSE_ID, MOCK_URL_BASE, COUNTER_INTERVAL_MS,
  SESSION_STORAGE_KEY, CAPACITY_STORAGE_KEY, SESSION_START_KEY,
  API_BASE_URL,
} from '../constants/options';
import InstructorGroupManagement from './InstructorGroupManagement';

// ── Helpers ────────────────────────────────────────────────────────────
const pad = n => String(n).padStart(2, '0');

function formatElapsed(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return h > 0
    ? `${pad(h)}:${pad(m)}:${pad(s)}`
    : `${pad(m)}:${pad(s)}`;
}

function formatRelativeTime(date) {
  if (!date) return null;
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 10) return 'Az önce';
  if (secs < 60) return `${secs} sn önce`;
  if (secs < 3600) return `${Math.floor(secs / 60)} dk önce`;
  return `${Math.floor(secs / 3600)} sa önce`;
}

// ── Component ──────────────────────────────────────────────────────────
function InstructorDashboard() {
  const [sessionActive, setSessionActive] = useState(
    () => localStorage.getItem(SESSION_STORAGE_KEY) === 'true'
  );
  const [studentCount, setStudentCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showManagement, setShowManagement] = useState(false);

  // Lifted group state
  const [groups, setGroups]               = useState([]);
  const [grouped, setGrouped]             = useState(false);
  const [classCapacity, setClassCapacity] = useState(
    () => localStorage.getItem(CAPACITY_STORAGE_KEY) || ''
  );

  // Feature G — session timer
  const [sessionStartTime, setSessionStartTime] = useState(
    () => { const t = localStorage.getItem(SESSION_START_KEY); return t ? parseInt(t) : null; }
  );
  const [elapsed, setElapsed] = useState(0);

  // Feature F — last join time
  const [lastJoinTime, setLastJoinTime] = useState(null);
  // Used to display relative time reactively
  const [, setTick] = useState(0);
  const prevCountRef = useRef(0);

  const mockUrl = `${MOCK_URL_BASE}${MOCK_COURSE_ID}`;

  // Sync sessionActive to localStorage
  useEffect(() => {
    localStorage.setItem(SESSION_STORAGE_KEY, String(sessionActive));
  }, [sessionActive]);

  // Sync classCapacity to localStorage
  useEffect(() => {
    if (classCapacity !== '') localStorage.setItem(CAPACITY_STORAGE_KEY, classCapacity);
  }, [classCapacity]);

  // Feature G — session timer (1-second tick)
  useEffect(() => {
    if (!sessionActive || !sessionStartTime) return;
    setElapsed(Math.floor((Date.now() - sessionStartTime) / 1000));
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - sessionStartTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionActive, sessionStartTime]);

  // Feature F — relative time display (re-render every 15s)
  useEffect(() => {
    if (!lastJoinTime) return;
    const interval = setInterval(() => setTick(t => t + 1), 15000);
    return () => clearInterval(interval);
  }, [lastJoinTime]);

  // Student count polling
  useEffect(() => {
    let interval;
    if (sessionActive) {
      const fetchStudentCount = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/hoca/gruplari-olustur/${MOCK_COURSE_ID}`);
          if (res.ok) {
            const data = await res.json();
            const newCount = data.ogrenciler ? data.ogrenciler.length : 0;
            // Feature F: detect new joins
            if (newCount > prevCountRef.current) {
              setLastJoinTime(new Date());
              setTick(t => t + 1);
            }
            prevCountRef.current = newCount;
            setStudentCount(newCount);
          }
        } catch (_) {
          // Silent per RULE[error-mesaji.md]
        }
      };
      fetchStudentCount();
      interval = setInterval(fetchStudentCount, COUNTER_INTERVAL_MS);
    } else {
      setStudentCount(0);
    }
    return () => clearInterval(interval);
  }, [sessionActive]);

  const handleStartSession = () => {
    const now = Date.now();
    setSessionActive(true);
    setSessionStartTime(now);
    localStorage.setItem(SESSION_START_KEY, String(now));
    prevCountRef.current = 0;
  };

  const handleStopSession = async () => {
    try {
      await fetch(`${API_BASE_URL}/hoca/oturumu-sifirla/${MOCK_COURSE_ID}`, { method: 'POST' });
    } catch (_) { /* silent */ }
    setSessionActive(false);
    setStudentCount(0);
    setGroups([]);
    setGrouped(false);
    setSessionStartTime(null);
    setElapsed(0);
    setLastJoinTime(null);
    prevCountRef.current = 0;
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(CAPACITY_STORAGE_KEY);
    localStorage.removeItem(SESSION_START_KEY);
    setClassCapacity('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(mockUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (showManagement) {
    return (
      <InstructorGroupManagement
        onBack={() => setShowManagement(false)}
        onFinish={async () => { await handleStopSession(); setShowManagement(false); }}
        groups={groups} setGroups={setGroups}
        grouped={grouped} setGrouped={setGrouped}
        classCapacity={classCapacity} setClassCapacity={setClassCapacity}
      />
    );
  }

  return (
    <div className="w-full max-w-4xl flex flex-col items-center justify-center min-h-[70vh]">
      {!sessionActive ? (
        <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl shadow-2xl w-full max-w-lg transition-all duration-300 hover:border-violet-500/20">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center mb-6 shadow-lg shadow-violet-500/20">
            <Sparkles className="h-8 w-8 text-white animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Grup Eşleştirme Oturumu
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-8 max-w-sm">
            Öğrencileriniz için anket doldurma ve arkadaş tercihi toplama sürecini başlatın. Oturum açıldığında bir QR kod ve katılım linki oluşturulacaktır.
          </p>
          <button onClick={handleStartSession}
            className="w-full py-4 px-6 rounded-xl font-bold text-white text-base bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98] shadow-lg shadow-violet-500/30 transition-all duration-200 uppercase tracking-widest">
            Yeni Oturum Başlat
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full transition-all duration-500 animate-fadeIn">

          {/* Left panel */}
          <div className="md:col-span-7 flex flex-col justify-between p-8 rounded-3xl border border-slate-800 bg-slate-900/30 backdrop-blur-xl shadow-xl h-full">
            <div>
              <div className="flex items-center space-x-2 text-violet-400 font-medium text-xs tracking-wider uppercase mb-3">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Aktif Eşleştirme Oturumu</span>
              </div>
              <h2 className="text-2xl font-black text-white flex items-center space-x-3 mb-2">
                <BookOpen className="h-6 w-6 text-violet-400" />
                <span>{MOCK_COURSE_ID} - Yazılım Mühendisliği</span>
              </h2>
              <p className="text-slate-400 text-sm mb-6">Dönem: 2026 Bahar • Öğretmen: NAZİFE DİMİLİLER</p>

              {/* URL */}
              <div className="space-y-2 mb-8">
                <label className="text-xs font-bold text-slate-500 tracking-wider uppercase">Katılım Linki</label>
                <div className="flex items-center space-x-2 rounded-xl bg-slate-950 p-1.5 border border-slate-800/80">
                  <div className="flex-1 overflow-x-auto whitespace-nowrap text-slate-400 text-xs px-3 py-1 font-mono scrollbar-hide">
                    {mockUrl}
                  </div>
                  <button onClick={handleCopy}
                    className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="Kopyala">
                    {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-800/60">

              {/* Feature F — katılım + son katılım */}
              <div className="p-4 rounded-2xl bg-violet-600/5 border border-violet-500/10 flex flex-col justify-between">
                <div className="flex items-center space-x-2 text-violet-400 mb-2">
                  <Users className="h-4 w-4" />
                  <span className="text-xs font-bold tracking-wider uppercase">Katılım</span>
                </div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl font-extrabold text-white tracking-tight">{studentCount}</span>
                  <span className="text-xs text-slate-500">Öğrenci</span>
                </div>
                {/* Feature F — last join time */}
                {lastJoinTime && (
                  <div className="mt-2 flex items-center gap-1.5 text-emerald-400">
                    <Activity className="h-3 w-3" />
                    <span className="text-[11px] font-medium">Son: {formatRelativeTime(lastJoinTime)}</span>
                  </div>
                )}
              </div>

              {/* Feature G — session timer */}
              <div className="p-4 rounded-2xl bg-indigo-600/5 border border-indigo-500/10 flex flex-col justify-between">
                <div className="flex items-center space-x-2 text-indigo-400 mb-2">
                  <Timer className="h-4 w-4" />
                  <span className="text-xs font-bold tracking-wider uppercase">Oturum Süresi</span>
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-slate-200 font-mono tracking-widest">
                    {formatElapsed(elapsed)}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">Anket Alınıyor</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col space-y-3">
              <button onClick={() => setShowManagement(true)}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98] shadow-lg shadow-violet-500/20 transition-all duration-200 text-xs tracking-wider uppercase flex items-center justify-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Öğrencileri ve Grupları Yönet</span>
              </button>
              <button onClick={handleStopSession}
                className="w-full py-3 px-4 rounded-xl font-bold text-slate-400 hover:text-rose-400 bg-slate-900/60 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/20 active:scale-[0.98] transition-all duration-200 text-xs tracking-wider uppercase flex items-center justify-center space-x-2">
                <XCircle className="h-4 w-4" />
                <span>Oturumu Kapat</span>
              </button>
            </div>
          </div>

          {/* Right panel: QR */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-8 rounded-3xl border border-slate-800 bg-slate-900/30 backdrop-blur-xl shadow-xl">
            <div className="p-4 rounded-2xl bg-white flex items-center justify-center shadow-2xl shadow-violet-500/10 mb-4 transition-transform duration-300 hover:scale-[1.02]">
              <QRCodeSVG value={mockUrl} size={230} bgColor="#FFFFFF" fgColor="#000000" level="H" includeMargin={false} />
            </div>
            <p className="text-slate-400 text-xs text-center font-medium leading-relaxed max-w-[200px]">
              Akıllı telefon kamerası ile QR kodu okutarak ankete katılabilirsiniz.
            </p>
          </div>

        </div>
      )}
    </div>
  );
}

export default InstructorDashboard;
