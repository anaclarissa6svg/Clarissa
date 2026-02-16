
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { ExerciseCard } from './components/ExerciseCard';
import { Diagnosis, Routine, RecoveryPhase, Patient, Session } from './types';
import { generateSessionRoutine } from './services/geminiService';

const App: React.FC = () => {
  // Persistencia en localStorage
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('rehabflow_patients');
    return saved ? JSON.parse(saved) : [];
  });

  const [view, setView] = useState<'list' | 'create' | 'session' | 'history'>('list');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estados de Formulario
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

  // Filtrado de pacientes por nombre (Identificación)
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
      setError('Error al procesar la evolución clínica con la IA.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header Dinámico Estilo Sitio Web */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              {view === 'list' && 'Gestión de Pacientes'}
              {view === 'create' && 'Añadir Nuevo Expediente'}
              {view === 'session' && `Nueva Sesión · ${selectedPatient?.name}`}
              {view === 'history' && `Historial Clínico · ${selectedPatient?.name}`}
            </h1>
            <nav className="flex items-center space-x-2 text-sm font-medium text-slate-400">
              <button onClick={() => setView('list')} className="hover:text-blue-600 transition-colors">Inicio</button>
              {view !== 'list' && (
                <>
                  <span>/</span>
                  <span className="text-slate-600 capitalize">{view}</span>
                </>
              )}
            </nav>
          </div>
          
          {view === 'list' && (
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Buscar por nombre..." 
                  className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-blue-50 outline-none w-64 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
              </div>
              <button 
                onClick={() => setView('create')}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center space-x-2"
              >
                <span>+</span>
                <span>Nuevo Paciente</span>
              </button>
            </div>
          )}
          
          {view !== 'list' && (
            <button 
              onClick={() => { setView('list'); setActiveRoutine(null); }}
              className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-sm transition-all"
            >
              ← Volver al Listado
            </button>
          )}
        </header>

        {/* View: List of Patients (Dashboard Style) */}
        {view === 'list' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pacientes</p>
                <p className="text-3xl font-black text-slate-900">{patients.length}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sesiones Hoy</p>
                <p className="text-3xl font-black text-blue-600">
                  {patients.reduce((acc, p) => acc + p.sessions.filter(s => s.date === new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })).length, 0)}
                </p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tratamientos Activos</p>
                <p className="text-3xl font-black text-emerald-600">{patients.filter(p => p.sessions.length > 0).length}</p>
              </div>
            </div>

            {/* Patients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPatients.length === 0 ? (
                <div className="col-span-full py-20 text-center space-y-4">
                  <div className="text-5xl opacity-20">📂</div>
                  <p className="text-slate-400 font-bold italic">No se encontraron expedientes con ese nombre.</p>
                  <button onClick={() => setView('create')} className="text-blue-600 font-bold underline">Crear nuevo paciente</button>
                </div>
              ) : (
                filteredPatients.map(p => (
                  <div key={p.id} className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all overflow-hidden flex flex-col">
                    <div className="p-8 flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl group-hover:bg-blue-50 transition-colors">👤</div>
                        <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded uppercase">{p.diagnosis.area}</span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mb-1">{p.name}</h3>
                      <p className="text-sm font-bold text-slate-400 line-clamp-1 mb-4">{p.diagnosis.condition}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-slate-50 p-3 rounded-2xl">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Sesiones</p>
                          <p className="text-lg font-black text-slate-700">{p.sessions.length}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-2xl">
                          <p className="text-[9px] font-black text-slate-400 uppercase">Último Dolor</p>
                          <p className="text-lg font-black text-slate-700">{p.sessions[0]?.painLevel ?? '-'}/10</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-8 pb-8 flex space-x-2">
                      <button 
                        onClick={() => { setSelectedPatientId(p.id); setView('session'); }}
                        className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-xs hover:bg-blue-600 transition-all"
                      >
                        Nueva Sesión
                      </button>
                      <button 
                        onClick={() => { setSelectedPatientId(p.id); setView('history'); }}
                        className="bg-white border border-slate-200 text-slate-600 px-4 py-3 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all"
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

        {/* View: Create Patient (Website Form Design) */}
        {view === 'create' && (
          <section className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500">
            <form onSubmit={handleCreatePatient} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nombre Completo del Paciente</label>
                  <input
                    type="text"
                    required
                    placeholder="Identificación del paciente"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold text-lg transition-all"
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Zona Anatómica</label>
                  <select 
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all appearance-none cursor-pointer"
                    value={diagnosis.area}
                    onChange={(e) => setDiagnosis({...diagnosis, area: e.target.value})}
                  >
                    {['Rodilla', 'Hombro', 'Espalda', 'Tobillo', 'Codo', 'Muñeca', 'Cadera', 'Cuello'].map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Diagnóstico Médico / Condición Física</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Esguince de tobillo grado II"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-bold text-lg transition-all"
                  value={diagnosis.condition}
                  onChange={(e) => setDiagnosis({...diagnosis, condition: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Notas Clínicas Iniciales</label>
                <textarea
                  rows={3}
                  placeholder="Antecedentes, cirugías, medicación actual..."
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none font-medium resize-none transition-all"
                  value={diagnosis.notes}
                  onChange={(e) => setDiagnosis({...diagnosis, notes: e.target.value})}
                />
              </div>
              <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black text-xl shadow-2xl shadow-blue-200 hover:scale-[1.01] transition-all active:scale-95">
                Crear Expediente Médico
              </button>
            </form>
          </section>
        )}

        {/* View: New Session (Pain Assessment) */}
        {view === 'session' && !activeRoutine && (
          <section className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 max-w-2xl mx-auto animate-in slide-in-from-bottom-8 duration-500">
            <div className="text-center mb-10">
              <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase mb-3">Evaluación de Seguimiento</div>
              <h2 className="text-3xl font-black text-slate-900">Estado Actual</h2>
              <p className="text-slate-400 font-medium">Define el nivel de dolor para ajustar el tratamiento</p>
            </div>
            
            <form onSubmit={handleStartSession} className="space-y-12">
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nivel de Dolor (Escala EVA)</label>
                  <div className="flex flex-col items-end">
                    <span className={`text-6xl font-black tabular-nums transition-colors ${currentPain > 6 ? 'text-red-500' : currentPain > 3 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {currentPain}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase mt-1">EVA / 10</span>
                  </div>
                </div>
                <input 
                  type="range" min="0" max="10" step="1" 
                  className="w-full h-4 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                  value={currentPain}
                  onChange={(e) => setCurrentPain(parseInt(e.target.value))}
                />
                <div className="flex justify-between text-[10px] font-black text-slate-300 uppercase">
                  <span className="flex items-center space-x-1"><span>🟢</span> <span>Inexistente</span></span>
                  <span className="flex items-center space-x-1"><span>🟡</span> <span>Moderado</span></span>
                  <span className="flex items-center space-x-1"><span>🔴</span> <span>Severo</span></span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Feedback del Paciente</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe sensaciones, limitaciones o mejoras detectadas desde la última sesión..."
                  className="w-full px-8 py-6 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[2rem] outline-none font-medium resize-none transition-all text-slate-700"
                  value={currentFeedback}
                  onChange={(e) => setCurrentFeedback(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black text-xl shadow-2xl hover:scale-[1.01] transition-all active:scale-95 flex items-center justify-center space-x-4"
              >
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Consultando Protocolos AI...</span>
                  </>
                ) : (
                  <>
                    <span>Generar Siguiente Fase</span>
                    <span className="text-2xl">→</span>
                  </>
                )}
              </button>
            </form>
          </section>
        )}

        {/* View: Active Routine / Treatment Results */}
        {activeRoutine && (
          <section className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-12">
            <div className={`p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between shadow-2xl ${
              selectedPatient?.sessions[0]?.clinicalDecision === 'Progresión' ? 'bg-emerald-600 shadow-emerald-100' : 
              selectedPatient?.sessions[0]?.clinicalDecision === 'Mantenimiento' ? 'bg-blue-600 shadow-blue-100' : 'bg-amber-600 shadow-amber-100'
            }`}>
              <div className="text-center md:text-left mb-6 md:mb-0">
                <div className="flex items-center justify-center md:justify-start space-x-2 mb-3">
                  <span className="px-3 py-1 bg-white/20 text-[10px] font-black rounded-full uppercase">Análisis Clínico AI</span>
                  <span className="text-white/70 text-xs font-bold">Confianza Evidencia: {activeRoutine.evidenceLevel}</span>
                </div>
                <h2 className="text-4xl font-black tracking-tight">{selectedPatient?.sessions[0]?.clinicalDecision}</h2>
                <p className="text-white/80 font-medium mt-2 max-w-md">Se han ajustado las cargas y volúmenes según tu nivel de dolor ({currentPain}/10).</p>
              </div>
              <div className="flex space-x-8">
                <div className="text-center">
                  <div className="text-4xl font-black">{activeRoutine.totalDuration}</div>
                  <div className="text-[10px] text-white/60 font-black uppercase tracking-widest">Minutos</div>
                </div>
                <div className="w-[1px] bg-white/20 h-16 hidden md:block"></div>
                <div className="text-center">
                  <div className="text-4xl font-black">{activeRoutine.exercises.length}</div>
                  <div className="text-[10px] text-white/60 font-black uppercase tracking-widest">Ejercicios</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4 px-2">Rutina Prescrita</h3>
                {activeRoutine.exercises.map(ex => <ExerciseCard key={ex.id} exercise={ex} />)}
              </div>
              <div className="space-y-8">
                <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm sticky top-10">
                  <h3 className="font-black text-slate-900 mb-6 flex items-center space-x-3 text-lg">
                    <span className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 text-sm">💡</span>
                    <span>Fundamento Médico</span>
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-8 italic font-medium">"{activeRoutine.rationale}"</p>
                  
                  <div className="space-y-6 pt-6 border-t border-slate-50">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Guías Consultadas</h4>
                    <ul className="space-y-4">
                      {activeRoutine.references.map((r, i) => (
                        <li key={i} className="text-xs font-bold text-slate-700 flex items-start space-x-3">
                          <span className="text-blue-500 mt-0.5">✓</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button 
                    onClick={() => { setView('list'); setActiveRoutine(null); }}
                    className="w-full mt-10 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all"
                  >
                    Finalizar y Guardar
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* View: Patient History (Session Log) */}
        {view === 'history' && selectedPatient && (
          <div className="space-y-10 max-w-4xl mx-auto animate-in fade-in duration-500">
            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-6 mb-6 md:mb-0">
                <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black">
                  {selectedPatient.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{selectedPatient.name}</h2>
                  <p className="text-slate-500 font-bold text-sm uppercase tracking-wide">{selectedPatient.diagnosis.condition}</p>
                </div>
              </div>
              <div className="flex items-center space-x-12 text-center">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Sesiones</p>
                  <p className="text-2xl font-black text-slate-800">{selectedPatient.sessions.length}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Fase Actual</p>
                  <p className="text-xs font-black px-3 py-1 bg-slate-100 rounded-full text-slate-600 uppercase mt-1">{selectedPatient.diagnosis.phase.split('(')[0]}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] px-2">Registro de Actividad</h3>
              {selectedPatient.sessions.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold">No hay sesiones registradas en este expediente.</p>
                  <button onClick={() => setView('session')} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-sm">Empezar Primera Sesión</button>
                </div>
              ) : (
                selectedPatient.sessions.map((s) => (
                  <div key={s.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="bg-slate-50 w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-slate-400 flex-shrink-0">
                        <span className="text-xs font-black text-slate-900">{s.date.split(' ')[0]}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest">{s.date.split(' ')[1]}</span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            s.clinicalDecision === 'Progresión' ? 'bg-emerald-100 text-emerald-700' :
                            s.clinicalDecision === 'Mantenimiento' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {s.clinicalDecision}
                          </span>
                          <span className="text-xs font-bold text-slate-400">Dolor: {s.painLevel}/10</span>
                        </div>
                        <p className="text-sm font-bold text-slate-700 line-clamp-1 italic">"{s.patientFeedback}"</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setActiveRoutine(s.routine); setView('session'); }}
                      className="whitespace-nowrap px-6 py-3 bg-slate-50 text-slate-600 rounded-xl font-black text-xs hover:bg-blue-600 hover:text-white transition-all"
                    >
                      Consultar Tratamiento Prescrito
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 p-6 bg-red-600 text-white rounded-3xl shadow-2xl flex items-center space-x-4 animate-in slide-in-from-bottom-10">
            <span className="text-2xl">⚠️</span>
            <span className="font-bold">{error}</span>
            <button onClick={() => setError(null)} className="ml-4 opacity-50 hover:opacity-100">✕</button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
