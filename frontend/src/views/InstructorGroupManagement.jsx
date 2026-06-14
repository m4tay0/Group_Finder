import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArrowLeft, Users, RefreshCcw, LayoutGrid, AlertCircle,
  CheckCircle2, Pencil, X, ArrowLeftRight, GripVertical,
  Copy, Download, Check, BookOpen, Clock, Wrench,
  MessageSquare, Zap, Target, BarChart3, Trash2,
  UserPlus, LogOut, Ungroup,
} from 'lucide-react';
import {
  MOCK_COURSE_ID, COUNTER_INTERVAL_MS,
  SURVEY_QUESTIONS, API_BASE_URL,
  GPA_MIN_VALUE, GPA_MAX_VALUE,
} from '../constants/options';

// ── Constants ──────────────────────────────────────────────────────────
const DEFAULT_GROUP_SIZE = 3;
const EDIT_RING_CLASS = 'ring-2 ring-amber-400/60 ring-offset-2 ring-offset-slate-950';

const ANKET_DISPLAY = [
  { key: 'musaitlik_zamani',       label: 'Müsaitlik',         Icon: Clock },
  { key: 'iletisim_formati',       label: 'İletişim Formatı',  Icon: MessageSquare },
  { key: 'haftalik_efor_saati',    label: 'Haftalık Efor',     Icon: Zap },
  { key: 'calisma_tarzi',          label: 'Çalışma Tarzı',     Icon: Target },
  { key: 'check_in_sikligi',       label: 'Check-in Sıklığı',  Icon: BarChart3 },
  { key: 'karar_alma_mekanizmasi', label: 'Karar Alma',        Icon: BookOpen },
  { key: 'kullanilan_araclar',     label: 'Kullanılan Araçlar',Icon: Wrench },
];

const ANKET_DEFAULTS = SURVEY_QUESTIONS.reduce((acc, q) => {
  acc[q.id] = q.options[0].value;
  return acc;
}, {});

// ── ConfirmModal ──────────────────────────────────────────────────────
function ConfirmModal({ title, message, warning, onConfirm, onCancel, confirmLabel = 'Onayla' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={onCancel}>
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-8 animate-scaleIn" onClick={e => e.stopPropagation()}>
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-rose-400" />
          </div>
          <h3 className="text-lg font-black text-white">{title}</h3>
        </div>
        <p className="text-slate-400 text-sm mb-2 leading-relaxed">{message}</p>
        {warning && (
          <p className="text-amber-400 text-xs font-semibold bg-amber-500/10 border border-amber-400/20 rounded-xl px-4 py-3 mb-6">
            ⚠ {warning}
          </p>
        )}
        <div className="flex space-x-3 mt-6">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all text-sm">
            İptal
          </button>
          <button onClick={onConfirm} className="flex-1 py-3 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-[0.98] transition-all text-sm">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── StudentModal ──────────────────────────────────────────────────────
function StudentModal({ student, onClose }) {
  if (!student) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-8 relative animate-scaleIn" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-slate-800">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-600/30 to-indigo-600/30 border border-violet-500/30 flex items-center justify-center text-violet-200 font-black text-2xl">
            {student.ad_soyad.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-black text-white">{student.ad_soyad}</h2>
            <p className="text-slate-400 text-sm font-mono">{student.ogrenci_id}</p>
          </div>
          <div className="ml-auto text-right">
            <span className="text-xs text-slate-500 uppercase tracking-wider">GPA</span>
            <p className="text-2xl font-black text-indigo-300">{student.gpa.toFixed(2)}</p>
          </div>
        </div>
        <div className="space-y-3">
          {ANKET_DISPLAY.map(({ key, label, Icon }) => (
            <div key={key} className="flex items-center justify-between rounded-xl px-4 py-2.5 bg-slate-800/50">
              <div className="flex items-center space-x-3 text-slate-400">
                <Icon className="h-4 w-4 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
              </div>
              <span className="text-sm font-semibold text-slate-200 text-right max-w-[55%]">
                {student.anket[key] || '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── EditableGroupName ─────────────────────────────────────────────────
function EditableGroupName({ name, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const inputRef = useRef(null);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);
  const commit = () => { onSave(draft.trim() || name); setEditing(false); };
  if (editing) {
    return (
      <input ref={inputRef} value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(name); setEditing(false); } }}
        className="bg-transparent text-white font-black text-lg border-b border-violet-400 outline-none w-full max-w-[160px]"
      />
    );
  }
  return (
    <button onClick={() => setEditing(true)} className="flex items-center space-x-1.5 group" title="Grup adını düzenle">
      <span className="text-lg font-black text-white">{name}</span>
      <Pencil className="h-3.5 w-3.5 text-slate-600 group-hover:text-violet-400 transition-colors" />
    </button>
  );
}

// ── AddStudentModal ───────────────────────────────────────────────────
function AddStudentModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    ogrenci_id: '',
    ad_soyad: '',
    gpa: '',
    istenen_arkadas_id: '',
  });
  const [anket, setAnket] = useState({ ...ANKET_DEFAULTS });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    const gpaVal = parseFloat(form.gpa);
    if (isNaN(gpaVal) || gpaVal < GPA_MIN_VALUE || gpaVal > GPA_MAX_VALUE) {
      setErr(`GPA ${GPA_MIN_VALUE} ile ${GPA_MAX_VALUE} arasında olmalıdır.`);
      return;
    }
    const payload = {
      ogrenci_id: parseInt(form.ogrenci_id),
      ad_soyad: form.ad_soyad.trim(),
      gpa: gpaVal,
      ders_id: MOCK_COURSE_ID,
      istenen_arkadas_id: form.istenen_arkadas_id ? parseInt(form.istenen_arkadas_id) : null,
      anket,
    };
    setSubmitting(true);
    setErr('');
    try {
      const res = await fetch(`${API_BASE_URL}/ogrenci/anket-kaydet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Kayıt başarısız.');
      }
      onSuccess();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-8 animate-scaleIn max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-white flex items-center space-x-2">
            <UserPlus className="h-5 w-5 text-violet-400" />
            <span>Öğrenci Manuel Ekle</span>
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Öğrenci No *</label>
              <input type="number" required value={form.ogrenci_id} onChange={e => setForm(p => ({ ...p, ogrenci_id: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors" placeholder="220101001" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">GPA *</label>
              <input type="number" step="0.01" min={GPA_MIN_VALUE} max={GPA_MAX_VALUE} required value={form.gpa} onChange={e => setForm(p => ({ ...p, gpa: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors" placeholder="3.50" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Ad Soyad *</label>
            <input type="text" required value={form.ad_soyad} onChange={e => setForm(p => ({ ...p, ad_soyad: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors" placeholder="Ad Soyad" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">İstenen Arkadaş No (Opsiyonel)</label>
            <input type="number" value={form.istenen_arkadas_id} onChange={e => setForm(p => ({ ...p, istened_arkadas_id: e.target.value, istenen_arkadas_id: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors" placeholder="220101002" />
          </div>

          {/* Survey answers */}
          <div className="pt-4 border-t border-slate-800">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Anket Cevapları</p>
            <div className="space-y-3">
              {SURVEY_QUESTIONS.map(q => (
                <div key={q.id}>
                  <label className="text-xs text-slate-400 block mb-1">{q.title}</label>
                  <select value={anket[q.id]} onChange={e => setAnket(p => ({ ...p, [q.id]: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors">
                    {q.options.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {err && <p className="text-rose-400 text-sm font-medium bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">{err}</p>}

          <button type="submit" disabled={submitting}
            className={`w-full py-3.5 rounded-xl font-bold text-white text-sm uppercase tracking-wide transition-all ${submitting ? 'bg-slate-700 cursor-wait' : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-[0.98] shadow-lg shadow-violet-500/20'}`}>
            {submitting ? 'Kaydediliyor...' : 'Öğrenciyi Ekle'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────
function InstructorGroupManagement({
  onBack, onFinish,
  groups, setGroups, grouped, setGrouped,
  classCapacity, setClassCapacity,
}) {
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [groupSize, setGroupSize]   = useState(DEFAULT_GROUP_SIZE);

  // Modes
  const [isEditMode, setIsEditMode]               = useState(false); // group swap
  const [isStudentEditMode, setIsStudentEditMode] = useState(false); // add/delete students
  const [movingStudent, setMovingStudent]         = useState(null);

  // Modals
  const [selectedStudent, setSelectedStudent]     = useState(null);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [showAddStudent, setShowAddStudent]       = useState(false);

  // Feature H — inline delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingId, setDeletingId]           = useState(null);

  // Feature I — last refresh indicator
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [refreshAge, setRefreshAge]       = useState(0);

  // Export
  const [copied, setCopied] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────
  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/hoca/gruplari-olustur/${MOCK_COURSE_ID}`);
      if (!res.ok) throw new Error('Veriler çekilirken hata oluştu.');
      const data = await res.json();
      setCourseData(data);
      setError(null);
      setLastRefreshed(new Date()); // Feature I
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Feature I — update refreshAge every second
  useEffect(() => {
    if (!lastRefreshed) return;
    const interval = setInterval(() => {
      setRefreshAge(Math.floor((Date.now() - lastRefreshed.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastRefreshed]);

  // Initial load + polling
  useEffect(() => {
    fetchStudents();
    const interval = setInterval(fetchStudents, COUNTER_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchStudents]);

  const students = courseData?.ogrenciler || [];
  const capacity   = parseInt(classCapacity) || 0;
  const fillPct    = capacity > 0 ? Math.min(100, Math.round((students.length / capacity) * 100)) : 0;

  // ── Grouping ──────────────────────────────────────────────────────────
  const handleGroup = () => {
    const size = Math.max(2, groupSize);
    const initial = [];
    for (let i = 0; i < students.length; i += size) {
      initial.push({ name: `Grup ${initial.length + 1}`, students: [...students.slice(i, i + size)] });
    }
    setGroups(initial);
    setGrouped(true);
  };

  const handleDissolve = () => {
    setGrouped(false);
    setGroups([]);
    setIsEditMode(false);
    setMovingStudent(null);
  };

  // ── Group swap (edit mode) ────────────────────────────────────────────
  const handlePickStudent = (student, fromGroupIdx) => {
    setMovingStudent(prev =>
      prev?.student.ogrenci_id === student.ogrenci_id ? null : { student, fromGroupIdx }
    );
  };

  const handleMoveToGroup = toGroupIdx => {
    if (!movingStudent) return;
    const { student, fromGroupIdx } = movingStudent;
    if (fromGroupIdx === toGroupIdx) { setMovingStudent(null); return; }
    setGroups(prev => {
      const next = prev.map(g => ({ ...g, students: [...g.students] }));
      next[fromGroupIdx].students = next[fromGroupIdx].students.filter(s => s.ogrenci_id !== student.ogrenci_id);
      next[toGroupIdx].students.push(student);
      return next.filter(g => g.students.length > 0);
    });
    setMovingStudent(null);
  };

  const handleRenameGroup = (idx, name) => {
    setGroups(prev => prev.map((g, i) => i === idx ? { ...g, name } : g));
  };

  // ── Student management ────────────────────────────────────────────────
  const handleDeleteStudent = async (ogrenci_id) => {
    setConfirmDeleteId(null); // clear inline confirm
    setDeletingId(ogrenci_id);
    try {
      const res = await fetch(`${API_BASE_URL}/hoca/ogrenci/${ogrenci_id}/ders/${MOCK_COURSE_ID}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Silme başarısız.');
      }
      await fetchStudents();
    } catch (_e) {
      // Silent fail
    } finally {
      setDeletingId(null);
    }
  };

  // ── Export ────────────────────────────────────────────────────────────
  const buildText = () =>
    groups.map(g => `${g.name}:\n` + g.students.map(s => `  • ${s.ad_soyad} (${s.ogrenci_id}) — GPA: ${s.gpa.toFixed(2)}`).join('\n')).join('\n\n');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildText());
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCSV = () => {
    const rows = [['Grup', 'Öğrenci No', 'Ad Soyad', 'GPA']];
    groups.forEach(g => g.students.forEach(s => rows.push([g.name, s.ogrenci_id, s.ad_soyad, s.gpa.toFixed(2)])));
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })),
      download: `${MOCK_COURSE_ID}_gruplar.csv`,
    });
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // ── Render ────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="w-full flex flex-col items-center justify-center p-12 min-h-[50vh]">
      <RefreshCcw className="h-10 w-10 text-violet-500 animate-spin mb-4" />
      <p className="text-slate-400 font-medium">Öğrenci verileri yükleniyor...</p>
    </div>
  );

  if (error) return (
    <div className="w-full flex flex-col items-center justify-center p-12 min-h-[50vh]">
      <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
      <p className="text-rose-400 font-medium">{error}</p>
      <button onClick={onBack} className="mt-6 text-slate-400 hover:text-white underline">Geri Dön</button>
    </div>
  );

  return (
    <>
      {/* Modals */}
      {selectedStudent && <StudentModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />}
      {showFinishConfirm && (
        <ConfirmModal
          title="Oturumu Bitir"
          message="Oturumu sonlandırmak istediğinize emin misiniz? Bu işlem tüm anket verilerini sıfırlayacaktır."
          warning={!grouped ? 'Henüz gruplandırma yapılmadı! Öğrenci verilerini kaybedeceksiniz.' : undefined}
          confirmLabel="Oturumu Bitir"
          onConfirm={async () => { setShowFinishConfirm(false); await onFinish(); }}
          onCancel={() => setShowFinishConfirm(false)}
        />
      )}
      {showAddStudent && (
        <AddStudentModal
          onClose={() => setShowAddStudent(false)}
          onSuccess={async () => { setShowAddStudent(false); await fetchStudents(); }}
        />
      )}

      <div className="w-full max-w-5xl flex flex-col items-center justify-start min-h-[70vh] animate-fadeIn">

        {/* Top bar */}
        <div className="w-full flex justify-between items-center mb-8">
          <button onClick={onBack}
            className="py-2.5 px-4 rounded-xl font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center space-x-2 text-xs uppercase tracking-wide">
            <ArrowLeft className="h-4 w-4" /><span>Geri Dön</span>
          </button>

          <div className="flex items-center gap-3">
            {/* Feature I — refresh age chip */}
            {lastRefreshed && (
              <span className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                <RefreshCcw className="h-3 w-3" />
                {refreshAge < 5 ? 'Az önce güncellendi' : `${refreshAge} sn önce`}
              </span>
            )}
            {/* Manual refresh */}
            <button onClick={fetchStudents} title="Yenile"
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all">
              <RefreshCcw className="h-4 w-4" />
            </button>
            <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300">
              <Users className="h-4 w-4" />
              <span className="text-sm font-bold">{students.length} Öğrenci</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="w-full mb-5">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 mb-1">
            Öğrenci Listesi ve Gruplandırma
          </h1>
          <p className="text-slate-400 text-sm">
            {courseData?.ders_id} — {courseData?.ders_adi} ({courseData?.donem})
          </p>
        </div>

        {/* Capacity bar */}
        <div className="w-full mb-6 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <BarChart3 className="h-5 w-5 text-violet-400" />
            <span className="text-sm font-bold text-slate-300 uppercase tracking-wide">Ders Kapasitesi</span>
          </div>
          <div className="flex items-center gap-3 flex-1">
            <input type="number" min="1" value={classCapacity}
              onChange={e => setClassCapacity(e.target.value)}
              placeholder="Toplam öğrenci sayısı..."
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500 w-52" />
            {capacity > 0 && (
              <div className="flex-1 flex items-center gap-3">
                <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${fillPct >= 100 ? 'bg-emerald-500' : fillPct >= 70 ? 'bg-violet-500' : 'bg-indigo-500'}`}
                    style={{ width: `${fillPct}%` }} />
                </div>
                <span className="text-sm font-bold text-slate-300 shrink-0">
                  {students.length}/{capacity}
                  <span className={`ml-1.5 text-xs ${fillPct >= 100 ? 'text-emerald-400' : 'text-slate-500'}`}>({fillPct}%)</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action bar */}
        <div className="w-full flex flex-col md:flex-row justify-between items-end gap-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Pre-group controls */}
            {!grouped && (
              <>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap">Grup Boyutu</span>
                  <input type="number" min="2" max="10" value={groupSize}
                    onChange={e => setGroupSize(parseInt(e.target.value) || DEFAULT_GROUP_SIZE)}
                    className="w-14 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm text-slate-200 text-center focus:outline-none focus:border-violet-500" />
                  <span className="text-xs text-slate-500">kişi</span>
                </div>

                <button onClick={() => setIsStudentEditMode(p => !p)}
                  className={`py-2.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center space-x-2 uppercase tracking-wide border
                    ${isStudentEditMode
                      ? 'text-sky-300 bg-sky-500/10 border-sky-400/40 hover:bg-sky-500/20'
                      : 'text-slate-300 bg-slate-800 border-slate-700 hover:border-slate-600 hover:text-white'}`}>
                  {isStudentEditMode ? <X className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  <span>{isStudentEditMode ? 'Düzenlemeyi Bitir' : 'Öğrencileri Düzenle'}</span>
                </button>

                {isStudentEditMode && (
                  <button onClick={() => setShowAddStudent(true)}
                    className="py-2.5 px-4 rounded-xl font-bold text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-400/40 hover:bg-emerald-500/20 transition-all flex items-center space-x-2 uppercase tracking-wide">
                    <UserPlus className="h-4 w-4" /><span>Öğrenci Ekle</span>
                  </button>
                )}
              </>
            )}

            {/* Post-group controls */}
            {grouped && (
              <>
                <button onClick={handleCopy}
                  className="py-2.5 px-4 rounded-xl font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center space-x-2 text-xs uppercase tracking-wide">
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? 'Kopyalandı!' : 'Kopyala'}</span>
                </button>
                <button onClick={handleDownloadCSV}
                  className="py-2.5 px-4 rounded-xl font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center space-x-2 text-xs uppercase tracking-wide">
                  <Download className="h-4 w-4" /><span>CSV İndir</span>
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-end">
            {/* Grupları Çöz */}
            {grouped && (
              <button onClick={handleDissolve}
                className="py-2.5 px-4 rounded-xl font-bold text-slate-300 hover:text-amber-300 bg-slate-800 hover:bg-amber-500/10 border border-slate-700 hover:border-amber-400/30 transition-all flex items-center space-x-2 text-xs uppercase tracking-wide">
                <Ungroup className="h-4 w-4" /><span>Grupları Çöz</span>
              </button>
            )}

            {/* Grupları Düzenle */}
            {grouped && (
              <button onClick={() => { setIsEditMode(p => !p); setMovingStudent(null); }}
                className={`py-3 px-5 rounded-xl font-bold text-sm transition-all flex items-center space-x-2 uppercase tracking-wide border
                  ${isEditMode
                    ? 'text-amber-300 bg-amber-500/10 border-amber-400/40 hover:bg-amber-500/20 shadow-lg shadow-amber-500/10'
                    : 'text-slate-300 bg-slate-800 border-slate-700 hover:border-slate-600 hover:text-white'}`}>
                {isEditMode ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                <span>{isEditMode ? 'Düzenlemeyi Bitir' : 'Grupları Düzenle'}</span>
              </button>
            )}

            {/* Gruplandır */}
            <button onClick={handleGroup} disabled={grouped || students.length === 0}
              className={`py-3 px-6 rounded-xl font-bold text-white text-sm transition-all flex items-center space-x-2 uppercase tracking-wide
                ${grouped
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/20 active:scale-[0.98]'}`}>
              {grouped ? <CheckCircle2 className="h-5 w-5" /> : <LayoutGrid className="h-5 w-5" />}
              <span>{grouped ? 'Gruplar Oluşturuldu' : 'Gruplandırmayı Çalıştır'}</span>
            </button>
          </div>
        </div>

        {/* Edit mode banners */}
        {isEditMode && (
          <div className="w-full mb-5 px-5 py-3 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center gap-3 animate-fadeIn">
            <ArrowLeftRight className="h-5 w-5 text-amber-400 shrink-0" />
            <p className="text-amber-300 text-sm font-medium">
              <span className="font-bold">Grupları Düzenle Aktif.</span> Taşımak istediğiniz öğrenciyi seçin, ardından hedef grup kartına tıklayın.
              {movingStudent && <span className="ml-2 text-amber-200">→ <span className="font-black underline">{movingStudent.student.ad_soyad}</span> taşınıyor...</span>}
            </p>
          </div>
        )}
        {isStudentEditMode && (
          <div className="w-full mb-5 px-5 py-3 rounded-2xl bg-sky-500/10 border border-sky-400/30 flex items-center gap-3 animate-fadeIn">
            <UserPlus className="h-5 w-5 text-sky-400 shrink-0" />
            <p className="text-sky-300 text-sm font-medium">
              <span className="font-bold">Öğrencileri Düzenle Aktif.</span> Öğrenci ekleyebilir veya silme ikonuna tıklayarak listeden çıkarabilirsiniz.
            </p>
          </div>
        )}

        {/* Main content */}
        <div className="w-full rounded-3xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl shadow-2xl overflow-hidden">
          {!grouped ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="text-xs text-slate-500 uppercase bg-slate-950/50 border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-bold tracking-wider">Öğrenci No</th>
                    <th className="px-6 py-4 font-bold tracking-wider">Ad Soyad</th>
                    <th className="px-6 py-4 font-bold tracking-wider">GPA</th>
                    <th className="px-6 py-4 font-bold tracking-wider">Çalışma Tarzı</th>
                    <th className="px-6 py-4 font-bold tracking-wider">Detay</th>
                    {isStudentEditMode && <th className="px-6 py-4 font-bold tracking-wider">İşlem</th>}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, idx) => (
                    <tr key={student.ogrenci_id}
                      className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${idx % 2 === 0 ? 'bg-slate-900/20' : ''}`}>
                      <td className="px-6 py-4 font-mono text-slate-300">{student.ogrenci_id}</td>
                      <td className="px-6 py-4 font-medium text-white">{student.ad_soyad}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 font-bold border border-indigo-500/20">
                          {student.gpa.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">{student.anket.calisma_tarzi}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => setSelectedStudent(student)}
                          className="text-xs text-violet-400 hover:text-violet-200 underline underline-offset-2">
                          Görüntüle
                        </button>
                      </td>
                      {isStudentEditMode && (
                        <td className="px-6 py-4">
                          {/* Feature H — inline delete confirmation */}
                          {confirmDeleteId === student.ogrenci_id ? (
                            <div className="flex items-center gap-2 animate-fadeIn">
                              <span className="text-xs text-rose-400 font-medium whitespace-nowrap">Emin misin?</span>
                              <button
                                onClick={() => handleDeleteStudent(student.ogrenci_id)}
                                disabled={deletingId === student.ogrenci_id}
                                className="px-2 py-1 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-all disabled:opacity-40">
                                {deletingId === student.ogrenci_id ? '...' : 'Evet'}
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-1 rounded-lg text-xs font-bold text-slate-400 bg-slate-800 hover:bg-slate-700 transition-all">
                                İptal
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(student.ogrenci_id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      )}

                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={isStudentEditMode ? 6 : 5} className="px-6 py-8 text-center text-slate-500">
                        Henüz anketi dolduran öğrenci bulunmamaktadır.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group, groupIdx) => {
                  const isDropTarget = isEditMode && movingStudent && movingStudent.fromGroupIdx !== groupIdx;
                  return (
                    <div key={groupIdx} onClick={() => isDropTarget && handleMoveToGroup(groupIdx)}
                      className={`p-6 rounded-2xl bg-slate-950 border transition-all duration-300 relative
                        ${isEditMode ? `${EDIT_RING_CLASS} border-amber-400/30` : 'border-slate-800 hover:border-violet-500/50'}
                        ${isDropTarget ? 'cursor-pointer border-violet-500 bg-violet-900/20 scale-[1.02] shadow-lg shadow-violet-500/20' : ''}`}>
                      {isDropTarget && <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-violet-400 pointer-events-none animate-pulse" />}

                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
                        <div className="flex items-center space-x-2">
                          <Users className={`h-5 w-5 shrink-0 ${isEditMode ? 'text-amber-400' : 'text-violet-400'}`} />
                          <EditableGroupName name={group.name} onSave={name => handleRenameGroup(groupIdx, name)} />
                        </div>
                        <span className="text-xs font-bold text-slate-500 bg-slate-900 px-2 py-1 rounded-md">{group.students.length} Üye</span>
                      </div>

                      <ul className="space-y-3">
                        {group.students.map(s => {
                          const isSelected = movingStudent?.student.ogrenci_id === s.ogrenci_id;
                          return (
                            <li key={s.ogrenci_id}
                              onClick={e => { e.stopPropagation(); isEditMode ? handlePickStudent(s, groupIdx) : setSelectedStudent(s); }}
                              className={`flex items-center justify-between rounded-xl px-3 py-2 transition-all cursor-pointer
                                ${isEditMode ? 'hover:bg-amber-500/10' : 'hover:bg-slate-800/60'}
                                ${isSelected ? 'bg-amber-500/20 ring-1 ring-amber-400/50 scale-[1.02]' : ''}`}>
                              <div className="flex items-center space-x-3">
                                {isEditMode && <GripVertical className={`h-4 w-4 shrink-0 ${isSelected ? 'text-amber-400' : 'text-slate-600'}`} />}
                                <div className={`h-8 w-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0
                                  ${isSelected ? 'bg-amber-500/30 border-amber-400/50 text-amber-200' : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300'}`}>
                                  {s.ad_soyad.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                  <span className={`text-sm font-semibold ${isSelected ? 'text-amber-200' : 'text-slate-200'}`}>{s.ad_soyad}</span>
                                  <span className="text-[10px] text-slate-500 font-mono">{s.ogrenci_id}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400">{s.gpa.toFixed(2)}</span>
                                {isEditMode && isSelected && <ArrowLeftRight className="h-4 w-4 text-amber-400 animate-pulse" />}
                              </div>
                            </li>
                          );
                        })}
                      </ul>

                      {isDropTarget && (
                        <div className="mt-3 text-center text-xs text-violet-400 font-bold tracking-wide uppercase animate-pulse">
                          ← Buraya Taşı
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Oturumu Bitir */}
        <div className="w-full mt-6">
          <button onClick={() => setShowFinishConfirm(true)}
            className="w-full py-3.5 px-4 rounded-2xl font-bold text-rose-400 hover:text-white bg-rose-500/5 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 active:scale-[0.98] transition-all duration-200 text-sm uppercase tracking-wider flex items-center justify-center space-x-2">
            <LogOut className="h-4 w-4" />
            <span>Oturumu Bitir ve Kapat</span>
          </button>
        </div>

      </div>
    </>
  );
}

export default InstructorGroupManagement;
