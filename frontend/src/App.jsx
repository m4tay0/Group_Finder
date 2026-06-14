import React, { useState, useEffect } from 'react';
import InstructorDashboard from './views/InstructorDashboard';
import StudentSurvey from './views/StudentSurvey';

function App() {
  const [view, setView] = useState('hoca'); // 'hoca' or 'katil'
  const [courseId, setCourseId] = useState('');

  useEffect(() => {
    // Basic route parsing from URL parameters
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    const dersIdParam = params.get('ders_id');

    if (viewParam === 'katil' && dersIdParam) {
      setView('katil');
      setCourseId(dersIdParam);
    } else {
      setView('hoca');
      setCourseId('');
    }
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 overflow-x-hidden flex flex-col font-sans select-none">
      {/* Decorative Premium Background Spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/20 blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[150px] pointer-events-none animate-pulse-slow"></div>

      {/* Header Bar */}
      <header className="w-full z-10 py-6 px-8 flex justify-between items-center border-b border-slate-800 bg-slate-950/60 backdrop-blur-md sticky top-0">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="font-extrabold text-white text-lg tracking-wider">GF</span>
          </div>
          <span className="font-black text-xl bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-300">
            Group Finder <span className="text-violet-500 text-sm font-semibold tracking-wide ml-1">MVP</span>
          </span>
        </div>
        
        {view === 'katil' && (
          <div className="flex items-center space-x-2 text-xs px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 font-semibold tracking-wide uppercase">
            <span className="h-2 w-2 rounded-full bg-violet-400 animate-ping"></span>
            <span>Öğrenci Girişi</span>
          </div>
        )}
        {view === 'hoca' && (
          <div className="flex items-center space-x-2 text-xs px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 font-semibold tracking-wide uppercase">
            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-ping"></span>
            <span>Öğretmen Paneli</span>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col items-center justify-center p-6 md:p-12 z-10">
        {view === 'katil' ? (
          <StudentSurvey courseId={courseId} />
        ) : (
          <InstructorDashboard />
        )}
      </main>

      {/* Premium Footer */}
      <footer className="w-full py-6 text-center text-slate-500 text-xs border-t border-slate-900 bg-slate-950/30">
        <p>© 2026 Group Finder MVP. Tüm Hakları Saklıdır.</p>
      </footer>
    </div>
  );
}

export default App;
