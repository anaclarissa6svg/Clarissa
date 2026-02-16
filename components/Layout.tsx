
import React, { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header / Navbar Superior */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center space-x-3 group cursor-pointer">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-100 group-hover:rotate-6 transition-all">
                  R
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-900 tracking-tight">Rehab<span className="text-blue-600">Flow</span></span>
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Clinical Suite</span>
                </div>
              </div>
              
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <button className="text-sm font-bold text-slate-900 border-b-2 border-blue-600 px-1 pt-1 h-20">Panel Principal</button>
                <button className="text-sm font-bold text-slate-500 hover:text-slate-900 border-b-2 border-transparent hover:border-slate-300 px-1 pt-1 h-20 transition-all">Pacientes</button>
                <button className="text-sm font-bold text-slate-500 hover:text-slate-900 border-b-2 border-transparent hover:border-slate-300 px-1 pt-1 h-20 transition-all">Biblioteca</button>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-bold text-slate-600 tracking-tight">Sincronizado</span>
              </div>
              <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="text-right">
                  <p className="text-xs font-black text-slate-900 leading-none">Dr. Specialist</p>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Plan Médico</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center text-blue-700 font-bold">
                  DS
                </div>
              </div>
            </div>

            <div className="flex items-center md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-all"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Menú Móvil */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileMenuOpen ? 'max-h-64 border-t' : 'max-h-0'}`}>
          <div className="px-4 py-6 space-y-4 bg-white">
            <button className="block w-full text-left font-bold text-blue-600 px-4 py-2 bg-blue-50 rounded-xl">Panel Principal</button>
            <button className="block w-full text-left font-bold text-slate-600 px-4 py-2">Pacientes</button>
            <button className="block w-full text-left font-bold text-slate-600 px-4 py-2">Configuración</button>
          </div>
        </div>
      </nav>

      {/* Hero Header Contextual */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                <span>Evidence-Based Practice</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Gestión Clínica <span className="text-blue-600">RehabFlow</span>
              </h1>
              <p className="mt-3 text-lg text-slate-500 font-medium leading-relaxed">
                Tu portal centralizado para la recuperación física de alta precisión, basada en guías internacionales y análisis de IA.
              </p>
            </div>
            <div className="hidden lg:flex gap-12 text-center">
              <div>
                <p className="text-3xl font-black text-slate-900">100%</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">EBM Verified</p>
              </div>
              <div className="w-[1px] bg-slate-200 h-12"></div>
              <div>
                <p className="text-3xl font-black text-slate-900">SaaS</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Web Platform</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {children}
        </div>
      </main>

      {/* Footer del Sitio Web */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black">R</div>
                <span className="font-black text-xl text-slate-900 tracking-tight">RehabFlow</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Soporte de decisiones clínicas para fisioterapeutas y médicos rehabilitadores.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Herramientas</h4>
              <ul className="space-y-3 text-sm font-bold text-slate-500">
                <li><button className="hover:text-blue-600 transition-colors">Nuevo Paciente</button></li>
                <li><button className="hover:text-blue-600 transition-colors">Protocolos JOSPT</button></li>
                <li><button className="hover:text-blue-600 transition-colors">Escala EVA AI</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Recursos</h4>
              <ul className="space-y-3 text-sm font-bold text-slate-500">
                <li><button className="hover:text-blue-600 transition-colors">Guías PEACE & LOVE</button></li>
                <li><button className="hover:text-blue-600 transition-colors">Webinars Clínicos</button></li>
                <li><button className="hover:text-blue-600 transition-colors">Criterios de Alta</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Soporte</h4>
              <ul className="space-y-3 text-sm font-bold text-slate-500">
                <li><button className="hover:text-blue-600 transition-colors">Centro de Ayuda</button></li>
                <li><button className="hover:text-blue-600 transition-colors">Contacto Profesional</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs font-bold text-slate-400">© 2024 RehabFlow Portal. Desarrollado para uso clínico profesional.</p>
            <div className="flex items-center space-x-6">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Medical Grade Security</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
