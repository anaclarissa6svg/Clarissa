
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { ExerciseCard } from './components/ExerciseCard';
import { Diagnosis, Routine, RecoveryPhase, Patient, Session } from './types';
import { generateSessionRoutine } from './services/geminiService';

const App: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('rehabflow_patients');
    return saved ? JSON.parse(saved) : [];
  });

  const [view, setView] = useState<'list' | 'create' | 'session' | 'history'>('list');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newPatientName, setNewPatientName] = useState('');
  const [diagnosis, setDiagnosis] = useState<Diagnosis>({
    area: 'Rodilla',
    condition: '',
    phase: RecoveryPhase.ACUTE,
    notes: ''
  });
  
  const [currentPain, setCurrentPain] = useState(0);
  const [currentFeedback, setCurrentFeedback] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);

  useEffect(() => {
    localStorage.setItem('rehabflow_patients', JSON.stringify(patients));
  }, [patients]);

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  const filteredPatients = useMemo(() => {
    return patients.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.diagnosis.condition.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [patients, searchQuery]);

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName || !diagnosis.condition) {
      setError('Por favor completa el nombre y el diagnóstico');
      return;
    }
    const newPatient: Patient = {
      id: crypto.randomUUID(),
      name: newPatientName,
      diagnosis: { ...diagnosis },
      sessions: []
    };
    setPatients([...patients, newPatient]);
    setSelectedPatientId(newPatient.id);
    setView('session');
    setNewPatientName('');
    setDiagnosis({ area: 'Rodilla', condition: '', phase: RecoveryPhase.ACUTE, notes: '' });
    setError(null);
  };

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    setIsLoading(true);
    setError(null);
    try {
      const { routine, decision } = await generateSessionRoutine(selectedPatient, currentPain, currentFeedback);
      setActiveRoutine(routine);
      
      const newSession: Session = {
        id: crypto.randomUUID(),
        date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
        painLevel: currentPain,
        patientFeedback: currentFeedback,
        routine: routine,
        clinicalDecision: decision as any
      };

      const updatedPatients = patients.map(p => 
        p.id === selectedPatient.id 
          ? { ...p, sessions: [newSession, ...p.sessions] } 
          : p
      );
      setPatients(updatedPatients);
    } catch (err) {
      setError('Error en el análisis clínico. Verifica tu conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* DASHBOARD PRINCIPAL */}
        {view === 'list' && (
          <div className="space-y-12 animate-in fade-in duration-700">
            
            {/* Header de Bienvenida Dinámico */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Panel de Control</h2>
                <p className="text-slate-500 font-medium">Bienvenido de nuevo, Dr. Specialist. Aquí tienes el resumen de tu clínica.</p>
              </div>
              <div className="flex items-center space-x-3">
                 <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Buscar por nombre o patología..." 
                    className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none w-full sm:w-64 lg:w-80 transition-all shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                </div>
                <button 
                  onClick={() => setView('create')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center space-x-2 whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Nuevo Paciente</span>
                  <span className="text-lg">+</span>
                </button>
              </div>
            </div>

            {/* Tarjetas de Métricas Rápidas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm group hover:border-blue-200 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">👥</div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base de Datos</span>
                </div>
                <p className="text-4xl font-black text-slate-900 tabular-nums">{patients.length}</p>
                <p className="text-sm font-bold text-slate-400 mt-1">Pacientes registrados</p>
              </div>
              
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm group hover:border-emerald-200 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">📈</div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">En Activo</span>
                </div>
                <p className="text-4xl font-black text-slate-900 tabular-nums">{patients.filter(p => p.sessions.length > 0).length}</p>
                <p className="text-sm font-bold text-slate-400 mt-1">Tratamientos en curso</p>
              </div>

              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm group hover:border-amber-200 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all">⚡</div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IA Insight</span>
                </div>
                <p className="text-4xl font-black text-slate-900 tabular-nums">
                  {patients.reduce((acc, p) => acc + p.sessions.length, 0)}
                </p>
                <p className="text-sm font-bold text-slate-400 mt-1">Protocolos generados</p>
              </div>
            </div>

            {/* Listado de Pacientes (Layout de Cuadrícula Elevada) */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] pl-1">Expedientes Recientes</h3>
                {filteredPatients.length > 0 && (
                  <span className="text-xs font-bold text-slate-400 italic">Mostrando {filteredPatients.length} resultados</span>
                )}
              </div>

              {filteredPatients.length === 0 ? (
                <div className="py-24 text-center bg-white rounded-[3.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-5xl mb-6 opacity-30">🗄️</div>
                  <h3 className="text-2xl font-black text-slate-900">Tu consulta está vacía</h3>
                  <p className="text-slate-400 font-bold max-w-sm mt-3 leading-relaxed">
                    Empieza registrando a tu primer paciente para generar protocolos de recuperación basados en evidencia.
                  </p>
                  <button 
                    onClick={() => setView('create')}
                    className="mt-10 bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-2xl hover:bg-blue-600 transition-all active:scale-95"
                  >
                    Registrar Primer Paciente
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredPatients.map(p => (
                    <div key={p.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col group relative overflow-hidden">
                      {/* Decorador de color según zona */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-bl-[4rem] -mr-8 -mt-8 transition-colors group-hover:bg-blue-100"></div>
                      
                      <div className="p-10 flex-1 relative z-10">
                        <div className="flex items-center space-x-4 mb-6">
                          <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center text-2xl font-black text-slate-500 group-hover:from-blue-600 group-hover:to-indigo-700 group-hover:text-white transition-all duration-500 shadow-inner">
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[9px] font-black rounded-lg uppercase tracking-widest border border-blue-100">{p.diagnosis.area}</span>
                            <h3 className="text-xl font-black text-slate-900 mt-1 leading-tight group-hover:text-blue-600 transition-colors">{p.name}</h3>
                          </div>
                        </div>
                        
                        <div className="space-y-4 pt-4 border-t border-slate-50">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Patología</p>
                          <p className="text-sm font-black text-slate-700 line-clamp-2 min-h-[2.5rem] leading-snug">{p.diagnosis.condition}</p>
                        </div>

                        <div className="mt-8 flex items-center justify-between bg-slate-50 p-4 rounded-2xl">
                          <div className="text-center">
                            <p className="text-[9px] font-black text-slate-400 uppercase">Sesiones</p>
                            <p className="text-lg font-black text-slate-900 tabular-nums">{p.sessions.length}</p>
                          </div>
                          <div className="w-[1px] h-8 bg-slate-200"></div>
                          <div className="text-center">
                            <p className="text-[9px] font-black text-slate-400 uppercase">Último Dolor</p>
                            <p className="text-lg font-black text-slate-900 tabular-nums">{p.sessions[0]?.painLevel ?? '-'}/10</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-8 pt-0 flex gap-2 relative z-10">
                        <button 
                          onClick={() => { setSelectedPatientId(p.id); setView('session'); }}
                          className="flex-[2] bg-slate-900 text-white py-4 rounded-xl font-black text-xs hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                        >
                          Nueva Sesión
                        </button>
                        <button 
                          onClick={() => { setSelectedPatientId(p.id); setView('history'); }}
                          className="flex-1 bg-white border-2 border-slate-100 text-slate-600 py-4 rounded-xl font-black text-xs hover:border-blue-600 hover:text-blue-600 transition-all active:scale-95"
                        >
                          Ver Historial
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VISTAS RESTANTES (Se mantienen igual para no perder funcionalidad) */}
        
        {view === 'create' && (
          <div className="animate-in zoom-in-95 duration-500">
             <div className="flex items-center mb-8">
              <button 
                onClick={() => setView('list')}
                className="text-slate-400 hover:text-blue-600 font-black text-sm transition-colors mr-4"
              >
                ← Cancelar
              </button>
              <h2 className="text-2xl font-black text-slate-900">Alta de Nuevo Paciente</h2>
            </div>
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100 max-w-4xl mx-auto">
              <div className="bg-slate-900 p-10 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black tracking-tight">Datos Clínicos</h3>
                  <p className="text-slate-400 font-medium">Define el punto de partida del tratamiento.</p>
                </div>
                <div className="text-5xl opacity-20">🏥</div>
              </div>
              <form onSubmit={handleCreatePatient} className="p-10 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      placeholder="Identificación del paciente"
                      className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[2rem] outline-none font-black text-xl transition-all"
                      value={newPatientName}
                      onChange={(e) => setNewPatientName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Zona a Tratar</label>
                    <div className="relative">
                      <select 
                        className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[2rem] outline-none font-black text-lg text-slate-700 transition-all appearance-none cursor-pointer"
                        value={diagnosis.area}
                        onChange={(e) => setDiagnosis({...diagnosis, area: e.target.value})}
                      >
                        {['Rodilla', 'Hombro', 'Espalda', 'Tobillo', 'Codo', 'Muñeca', 'Cadera', 'Cuello'].map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                      <span className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Diagnóstico Específico</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Tendinopatía rotuliana crónica"
                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[2rem] outline-none font-black text-xl transition-all"
                    value={diagnosis.condition}
                    onChange={(e) => setDiagnosis({...diagnosis, condition: e.target.value})}
                  />
                </div>
                <button type="submit" className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">
                  Confirmar Registro
                </button>
              </form>
            </div>
          </div>
        )}

        {view === 'session' && !activeRoutine && (
          <div className="animate-in slide-in-from-bottom-8 duration-500">
             <div className="flex items-center mb-8">
              <button 
                onClick={() => setView('list')}
                className="text-slate-400 hover:text-blue-600 font-black text-sm transition-colors mr-4"
              >
                ← Listado
              </button>
              <h2 className="text-2xl font-black text-slate-900">Nueva Evaluación</h2>
            </div>
            <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100 max-w-2xl mx-auto">
              <div className="text-center mb-12">
                <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-blue-100 inline-block mb-4">Evaluación de Seguimiento</span>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedPatient?.name}</h2>
                <p className="text-slate-400 font-bold mt-2">Reporte de dolor para el ajuste de carga.</p>
              </div>
              
              <form onSubmit={handleStartSession} className="space-y-12">
                <div className="space-y-8">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nivel de Dolor (EVA)</label>
                    <span className={`text-6xl font-black tabular-nums transition-all ${currentPain > 6 ? 'text-red-500 scale-110' : currentPain > 3 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {currentPain}
                    </span>
                  </div>
                  <input 
                    type="range" min="0" max="10" step="1" 
                    className="w-full h-4 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                    value={currentPain}
                    onChange={(e) => setCurrentPain(parseInt(e.target.value))}
                  />
                  <div className="flex justify-between text-[9px] font-black text-slate-300 uppercase">
                    <span>🟢 Mínimo</span>
                    <span>🟡 Moderado</span>
                    <span>🔴 Intolerable</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Feedback del Paciente</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="¿Qué sensaciones ha tenido hoy?..."
                    className="w-full px-8 py-6 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[2rem] outline-none font-bold text-slate-700 resize-none transition-all"
                    value={currentFeedback}
                    onChange={(e) => setCurrentFeedback(e.target.value)}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xl shadow-2xl hover:bg-blue-600 transition-all flex items-center justify-center space-x-4"
                >
                  {isLoading ? (
                    <>
                      <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span>Consultando IA Médica...</span>
                    </>
                  ) : (
                    <>
                      <span>Generar Prescripción</span>
                      <span className="text-2xl">→</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeRoutine && (
          <div className="space-y-12 animate-in fade-in duration-700">
             <div className={`p-12 rounded-[3.5rem] text-white flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden ${
              selectedPatient?.sessions[0]?.clinicalDecision === 'Progresión' ? 'bg-emerald-600' : 
              selectedPatient?.sessions[0]?.clinicalDecision === 'Mantenimiento' ? 'bg-blue-600' : 'bg-amber-600'
            }`}>
              <div className="text-center md:text-left z-10">
                <span className="px-4 py-1.5 bg-white/20 text-[10px] font-black rounded-full uppercase tracking-widest inline-block mb-4">Decisión Médica Tomada</span>
                <h2 className="text-5xl font-black tracking-tight">{selectedPatient?.sessions[0]?.clinicalDecision}</h2>
                <p className="text-white/80 font-bold mt-3 text-lg">Sesión ajustada para dolor EVA {currentPain}/10.</p>
              </div>
              <div className="flex space-x-12 mt-8 md:mt-0 z-10">
                <div className="text-center">
                  <p className="text-5xl font-black">{activeRoutine.totalDuration}</p>
                  <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mt-2">Minutos</p>
                </div>
                <div className="text-center">
                  <p className="text-5xl font-black">{activeRoutine.exercises.length}</p>
                  <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mt-2">Ejercicios</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-8">
                {activeRoutine.exercises.map(ex => <ExerciseCard key={ex.id} exercise={ex} />)}
              </div>
              <div className="space-y-8">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm sticky top-28">
                  <h3 className="font-black text-slate-900 mb-6 flex items-center space-x-3 text-xl">
                    <span className="text-blue-600 font-serif text-2xl">i</span>
                    <span>Justificación Clínica</span>
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed italic font-bold mb-8">"{activeRoutine.rationale}"</p>
                  
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Literatura Consultada</h4>
                    <ul className="space-y-4">
                      {activeRoutine.references.map((r, i) => (
                        <li key={i} className="text-xs font-bold text-slate-800 flex items-start space-x-3">
                          <span className="text-blue-500 mt-0.5">✓</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <button 
                      onClick={() => { setView('list'); setActiveRoutine(null); }}
                      className="w-full mt-10 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm hover:bg-blue-600 transition-all shadow-xl shadow-slate-100"
                    >
                      Guardar y Salir al Panel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'history' && selectedPatient && (
          <div className="animate-in fade-in duration-500 max-w-4xl mx-auto space-y-10">
             <div className="flex items-center mb-8">
              <button 
                onClick={() => setView('list')}
                className="text-slate-400 hover:text-blue-600 font-black text-sm transition-colors mr-4"
              >
                ← Listado
              </button>
              <h2 className="text-2xl font-black text-slate-900">Historial Clínico</h2>
            </div>
            <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center space-x-8">
                <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white text-4xl font-black">
                  {selectedPatient.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight">{selectedPatient.name}</h2>
                  <p className="text-blue-400 font-bold uppercase text-xs tracking-widest mt-1">{selectedPatient.diagnosis.condition}</p>
                </div>
              </div>
              <div className="flex space-x-12 text-center md:text-right">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sesiones Totales</p>
                  <p className="text-4xl font-black text-white tabular-nums">{selectedPatient.sessions.length}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {selectedPatient.sessions.map((s) => (
                <div key={s.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
                  <div className="bg-slate-50 w-20 h-20 rounded-3xl flex flex-col items-center justify-center text-slate-400">
                    <span className="text-xs font-black text-slate-900">{s.date.split(' ')[0]}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{s.date.split(' ')[1]}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                        s.clinicalDecision === 'Progresión' ? 'bg-emerald-50 text-emerald-600' :
                        s.clinicalDecision === 'Mantenimiento' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {s.clinicalDecision}
                      </span>
                      <span className="text-xs font-bold text-slate-400">Dolor EVA: {s.painLevel}/10</span>
                    </div>
                    <p className="text-sm font-bold text-slate-700 italic">"{s.patientFeedback}"</p>
                  </div>
                  <button 
                    onClick={() => { setActiveRoutine(s.routine); setView('session'); }}
                    className="bg-slate-100 text-slate-600 px-8 py-4 rounded-xl font-black text-xs hover:bg-blue-600 hover:text-white transition-all"
                  >
                    Ver Rutina
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global Notifications */}
        {error && (
          <div className="fixed bottom-12 right-12 p-6 bg-red-600 text-white rounded-3xl shadow-2xl flex items-center space-x-6 animate-in slide-in-from-right-10 z-[100]">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl font-black">!</div>
            <div>
              <p className="text-[10px] font-black uppercase text-white/70 tracking-widest">Error Sistema</p>
              <p className="font-bold text-sm">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="p-2 hover:bg-white/10 rounded-lg transition-all">✕</button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
