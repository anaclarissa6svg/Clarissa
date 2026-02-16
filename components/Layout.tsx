
import React, { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">R</div>
          <span className="font-bold text-xl text-slate-800 tracking-tight">RehabFlow</span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </header>

      {/* Sidebar (Mac/iPad style) */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white border-r transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="hidden md:flex items-center space-x-2 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">R</div>
            <span className="font-bold text-2xl text-slate-800 tracking-tight">RehabFlow</span>
          </div>

          <nav className="flex-1 space-y-1">
            <SidebarItem icon="👥" label="Pacientes" active />
            <SidebarItem icon="📂" label="Expedientes" />
            <SidebarItem icon="📊" label="Estadísticas" />
            <SidebarItem icon="⚙️" label="Configuración" />
          </nav>

          <div className="mt-auto p-4 bg-blue-50 rounded-2xl">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Motor Clínico</p>
            <p className="text-xs text-slate-700 font-bold">v3.5 Evidence-Based</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto h-screen scroll-hide">
        <div className="max-w-5xl mx-auto p-6 md:p-10 pb-24">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-lg border-t flex justify-around p-3 z-50">
        <button className="flex flex-col items-center text-blue-600"><span className="text-xl">👥</span><span className="text-[10px] font-medium">Pacientes</span></button>
        <button className="flex flex-col items-center text-slate-400"><span className="text-xl">📂</span><span className="text-[10px] font-medium">Archivos</span></button>
        <button className="flex flex-col items-center text-slate-400"><span className="text-xl">⚙️</span><span className="text-[10px] font-medium">Ajustes</span></button>
      </nav>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

const SidebarItem: React.FC<{ icon: string; label: string; active?: boolean }> = ({ icon, label, active }) => (
  <button className={`
    w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
    ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-600 hover:bg-slate-50'}
  `}>
    <span className="text-xl">{icon}</span>
    <span className="font-semibold">{label}</span>
  </button>
);
