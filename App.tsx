
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
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="space-y-12 max-w-6xl mx-auto">
        
        {/* Breadcrumbs de Navegación del Sitio */}
        <div className="flex items-center justify-between gap-4">
          <nav className="flex items-center space-x-2 text-sm font-bold">
            <button 
              onClick={() => { setView('list'); setActiveRoutine(null); }}
              className={`transition-colors ${view === 'list' ? 'text-slate-900' : 'text-slate-400 hover:text-blue-600'}`}
            >
              Portal Principal
            </button>
            {view !== 'list' && (
              <>
                <span className="text-slate-300">/</span>
                <span className="text-blue-600 capitalize">
                  {view === 'create' ? 'Alta de Paciente' : view === 'session' ? 'Evaluación' : 'Historial Clínico'}
                </span>
              </>
            )}
          </nav>
          
          {view === 'list' && (
            <button 
              onClick={() => setView('create')}
              className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center space-x-2"
            >
              <span>Nuevo Registro</span>
              <span className="text-lg">+</span>
            </button>
          )}
        </div>

        {/* VISTA: LISTADO DE PACIENTES (ESTILO DASHBOARD) */}
        {view === 'list' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Buscador de Sitio Web */}
            <div className="relative max-w-md">
              <input 
                type="text" 
                placeholder="Identificar paciente por nombre..." 
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            </div>

            {/* Grid de Pacientes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPatients.length === 0 ? (
                <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                  <div className="text-6xl mb-6 opacity-20">📂</div>
                  <h3 className="text-xl font-black text-slate-900">Sin expedientes activos</h3>
                  <p className="text-slate-400 font-bold max-w-sm mx-auto mt-2">Introduce el nombre del paciente para iniciar su seguimiento o crea uno nuevo.</p>
                  <button onClick={() => setView('create')} className="mt-8 text-blue-600 font-black hover:underline">Crear nuevo registro médico</button>
                </div>
              ) : (
                filteredPatients.map(p => (
                  <div key={p.id} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col">
                    <div className="p-10 flex-1">
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                          {p.name.charAt(0)}
                        </div>
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg uppercase tracking-widest border border-blue-100">{p.diagnosis.area}</span>
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 mb-1 tracking-tight">{p.name}</h3>
                      <p className="text-xs font-bold text-slate-400 line-clamp-1 mb-8">{p.diagnosis.condition}</p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3 rounded-2xl">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Sesiones</p>
                          <p className="text-lg font-black text-slate-700">{p.sessions.length}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-2xl">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Estado</p>
                          <p className="text-xs font-black text-emerald-600 mt-1 uppercase">Activo</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-10 pt-0 flex gap-3">
                      <button 
                        onClick={() => { setSelectedPatientId(p.id); setView('session'); }}
                        className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs hover:bg-blue-600 transition-all shadow-lg"
                      >
                        Nueva Sesión
                      </button>
                      <button 
                        onClick={() => { setSelectedPatientId(p.id); setView('history'); }}
                        className="bg-white border-2 border-slate-100 text-slate-600 px-5 py-4 rounded-2xl font-black text-xs hover:border-blue-600 hover:text-blue-600 transition-all"
                      >
                        Historial
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* VISTA: CREAR PACIENTE (FORMULARIO WEB) */}
        {view === 'create' && (
          <section className="max-w-4xl mx-auto animate-in zoom-in-95 duration-500">
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100">
              <div className="bg-slate-900 p-10 text-white">
                <h2 className="text-3xl font-black tracking-tight">Registro de Nuevo Expediente</h2>
                <p className="text-slate-400 font-medium mt-2">Completa la ficha técnica inicial del paciente.</p>
              </div>
              <form onSubmit={handleCreatePatient} className="p-10 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Identificación / Nombre del Paciente</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Juan Pérez García"
                      className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[2rem] outline-none font-black text-xl transition-all"
                      value={newPatientName}
                      onChange={(e) => setNewPatientName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Zona Anatómica a Tratar</label>
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
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Diagnóstico Médico</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Rotura fibrilar isquiotibiales grado I"
                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[2rem] outline-none font-black text-xl transition-all"
                    value={diagnosis.condition}
                    onChange={(e) => setDiagnosis({...diagnosis, condition: e.target.value})}
                  />
                </div>
                <button type="submit" className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">
                  Confirmar Alta Clínica
                </button>
              </form>
            </div>
          </section>
        )}

        {/* VISTA: SESIÓN / EVALUACIÓN (ASISTENTE WEB) */}
        {view === 'session' && !activeRoutine && (
          <section className="max-w-2xl mx-auto animate-in slide-in-from-bottom-8 duration-500">
            <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100">
              <div className="text-center mb-12">
                <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-blue-100 inline-block mb-4">Evaluación de Evolución</span>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Escala de Dolor Actual</h2>
                <p className="text-slate-400 font-bold mt-2">Reporte del paciente para ajuste de carga.</p>
              </div>
              
              <form onSubmit={handleStartSession} className="space-y-12">
                <div className="space-y-8">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dolor EVA (0-10)</label>
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
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Comentarios del Paciente</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe sensaciones, limitaciones funcionales detectadas hoy..."
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
                      <span>Consultando Protocolos...</span>
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
          </section>
        )}

        {/* VISTA: RESULTADO DE RUTINA (RESULTADOS WEB) */}
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
                      className="w-full mt-10 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm hover:scale-105 transition-all shadow-xl shadow-slate-100"
                    >
                      Guardar y Finalizar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notificaciones Globales */}
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
