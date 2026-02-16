
import React, { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 antialiased">
      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-xl border-b sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-100">R</div>
          <span className="font-black text-xl text-slate-900 tracking-tight">RehabFlow</span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </header>

      {/* Sidebar (Desktop/iPad) */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-80 bg-white border-r border-slate-100 transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-8">
          <div className="hidden md:flex items-center space-x-3 mb-12">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl shadow-blue-100">R</div>
            <div>
              <span className="font-black text-2xl text-slate-900 tracking-tight block">RehabFlow</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Clinical Management</span>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            <SidebarItem icon="👥" label="Pacientes" active />
            <SidebarItem icon="📂" label="Expedientes" />
            <SidebarItem icon="🗓️" label="Agenda" />
            <SidebarItem icon="📊" label="Estadísticas" />
            <div className="pt-8 pb-4">
              <span className="px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Sistema</span>
            </div>
            <SidebarItem icon="⚙️" label="Configuración" />
            <SidebarItem icon="👤" label="Mi Cuenta" />
          </nav>

          <div className="mt-auto pt-8">
            <div className="p-6 bg-slate-900 rounded-[2rem] text-white shadow-2xl shadow-slate-200 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl font-black">AI</div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Motor Clínico</p>
              <p className="text-sm font-bold mb-4">v3.5 Evidence-Based</p>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Sistema Online</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto h-screen scroll-hide">
        <div className="p-6 md:p-12 pb-32">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar (App style) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-2xl border-t border-slate-100 flex justify-around p-4 z-50">
        <button className="flex flex-col items-center space-y-1 text-blue-600">
          <span className="text-2xl">👥</span>
          <span className="text-[10px] font-black uppercase">Pacientes</span>
        </button>
        <button className="flex flex-col items-center space-y-1 text-slate-400">
          <span className="text-2xl">📂</span>
          <span className="text-[10px] font-black uppercase">Archivos</span>
        </button>
        <button className="flex flex-col items-center space-y-1 text-slate-400">
          <span className="text-2xl">📊</span>
          <span className="text-[10px] font-black uppercase">Reportes</span>
        </button>
        <button className="flex flex-col items-center space-y-1 text-slate-400">
          <span className="text-2xl">⚙️</span>
          <span className="text-[10px] font-black uppercase">Ajustes</span>
        </button>
      </nav>

      {/* Backdrop for mobile interaction */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden animate-in fade-in duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

const SidebarItem: React.FC<{ icon: string; label: string; active?: boolean }> = ({ icon, label, active }) => (
  <button className={`
    w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300
    ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 scale-[1.02]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
  `}>
    <span className="text-xl">{icon}</span>
    <span className="font-bold text-sm tracking-tight">{label}</span>
  </button>
);
