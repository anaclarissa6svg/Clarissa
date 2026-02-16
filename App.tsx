
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { ExerciseCard } from './components/ExerciseCard';
import { Diagnosis, Routine, RecoveryPhase, Patient, Session } from './types';
import { generateSessionRoutine } from './services/geminiService';

const App: React.FC = () => {
  // Persistence using localStorage
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('rehabflow_patients');
    return saved ? JSON.parse(saved) : [];
  });

  const [view, setView] = useState<'list' | 'create' | 'session' | 'history'>('list');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  
  // Form States
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
        date: new Date().toLocaleDateString(),
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
      setError('Error al procesar la evolución clínica.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Navigation / Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {view === 'list' && 'Expedientes Clínicos'}
              {view === 'create' && 'Nuevo Paciente'}
              {view === 'session' && `Nueva Sesión: ${selectedPatient?.name}`}
              {view === 'history' && `Historial: ${selectedPatient?.name}`}
            </h1>
            <p className="text-slate-500 font-medium">
              {view === 'list' && `${patients.length} pacientes registrados`}
              {view === 'session' && 'Evaluación de dolor y adaptación'}
            </p>
          </div>
          {view !== 'list' && (
            <button 
              onClick={() => { setView('list'); setActiveRoutine(null); }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors"
            >
              ← Volver
            </button>
          )}
        </div>

        {/* View: List of Patients */}
        {view === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
              onClick={() => setView('create')}
              className="h-48 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center space-y-3 hover:border-blue-400 hover:bg-blue-50 transition-all group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl group-hover:scale-110 transition-transform">+</div>
              <span className="font-bold text-slate-600">Nuevo Expediente</span>
            </button>
            {patients.map(p => (
              <div key={p.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-slate-800">{p.name}</h3>
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase">{p.diagnosis.area}</span>
                  </div>
                  <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-4">{p.diagnosis.condition}</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => { setSelectedPatientId(p.id); setView('session'); }}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100"
                  >
                    Nueva Sesión
                  </button>
                  <button 
                    onClick={() => { setSelectedPatientId(p.id); setView('history'); }}
                    className="px-4 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-sm border"
                  >
                    📜
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View: Create Patient */}
        {view === 'create' && (
          <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <form onSubmit={handleCreatePatient} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nombre del Paciente</label>
                  <input
                    type="text"
                    placeholder="Nombre Completo"
                    className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-bold text-lg"
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Área Clínica</label>
                  <select 
                    className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-bold"
                    value={diagnosis.area}
                    onChange={(e) => setDiagnosis({...diagnosis, area: e.target.value})}
                  >
                    {['Rodilla', 'Hombro', 'Espalda', 'Tobillo', 'Codo', 'Muñeca', 'Cadera', 'Cuello'].map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Diagnóstico Inicial</label>
                <input
                  type="text"
                  placeholder="Ej: Tendinopatía rotuliana"
                  className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-bold"
                  value={diagnosis.condition}
                  onChange={(e) => setDiagnosis({...diagnosis, condition: e.target.value})}
                />
              </div>
              <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-100">
                Crear Expediente y Continuar
              </button>
            </form>
          </section>
        )}

        {/* View: New Session (Pain Input) */}
        {view === 'session' && !activeRoutine && (
          <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 max-w-2xl mx-auto">
            <form onSubmit={handleStartSession} className="space-y-8">
              <div>
                <div className="flex justify-between items-end mb-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nivel de Dolor Hoy (EVA)</label>
                  <span className={`text-4xl font-black ${currentPain > 6 ? 'text-red-500' : currentPain > 3 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {currentPain}
                  </span>
                </div>
                <input 
                  type="range" min="0" max="10" step="1" 
                  className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  value={currentPain}
                  onChange={(e) => setCurrentPain(parseInt(e.target.value))}
                />
                <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase">
                  <span>Sin Dolor</span>
                  <span>Máximo Dolor</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">¿Cómo se siente el paciente?</label>
                <textarea
                  rows={4}
                  placeholder="Ej: 'Siento menos rigidez por la mañana pero molesta al subir escaleras'..."
                  className="w-full px-6 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-medium resize-none"
                  value={currentFeedback}
                  onChange={(e) => setCurrentFeedback(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center space-x-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Analizando Evolución...</span>
                  </>
                ) : (
                  <span>Determinar Siguiente Paso</span>
                )}
              </button>
            </form>
          </section>
        )}

        {/* View: Active Routine / Results */}
        {activeRoutine && (
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className={`p-6 rounded-[2rem] text-white flex items-center justify-between shadow-xl ${
              selectedPatient?.sessions[0]?.clinicalDecision === 'Progresión' ? 'bg-emerald-600' : 
              selectedPatient?.sessions[0]?.clinicalDecision === 'Mantenimiento' ? 'bg-blue-600' : 'bg-amber-600'
            }`}>
              <div>
                <span className="text-[10px] font-black uppercase bg-white/20 px-2 py-1 rounded">Decisión Clínica</span>
                <h2 className="text-3xl font-black">{selectedPatient?.sessions[0]?.clinicalDecision}</h2>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-white/70 uppercase">Evidencia</p>
                <p className="font-bold">{activeRoutine.evidenceLevel}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {activeRoutine.exercises.map(ex => <ExerciseCard key={ex.id} exercise={ex} />)}
              </div>
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm sticky top-10">
                  <h3 className="font-bold text-slate-800 mb-4">Justificación Médica</h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6 italic">"{activeRoutine.rationale}"</p>
                  
                  <h4 className="text-[10px] font-black text-slate-400 uppercase mb-3">Protocolos Consultados</h4>
                  <ul className="space-y-2">
                    {activeRoutine.references.map((r, i) => (
                      <li key={i} className="text-xs font-bold text-blue-600 flex items-center space-x-2">
                        <span>•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* View: History */}
        {view === 'history' && selectedPatient && (
          <div className="space-y-6 max-w-3xl mx-auto">
            {selectedPatient.sessions.length === 0 ? (
              <div className="text-center p-20 text-slate-400 font-bold">No hay sesiones registradas aún.</div>
            ) : (
              selectedPatient.sessions.map((s, idx) => (
                <div key={s.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start space-x-4">
                  <div className="bg-slate-50 w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                    <span className="text-xs font-bold">{s.date.split('/')[0]}</span>
                    <span className="text-[10px] uppercase">{s.date.split('/')[1]}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        s.clinicalDecision === 'Progresión' ? 'bg-emerald-100 text-emerald-700' :
                        s.clinicalDecision === 'Mantenimiento' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {s.clinicalDecision}
                      </span>
                      <span className="text-xs font-bold text-slate-400">Dolor: {s.painLevel}/10</span>
                    </div>
                    <p className="text-sm font-medium text-slate-700 line-clamp-2 italic">"{s.patientFeedback}"</p>
                    <button 
                      onClick={() => { setActiveRoutine(s.routine); setView('session'); }}
                      className="mt-3 text-xs font-bold text-blue-600 hover:underline"
                    >
                      Ver Rutina Generada →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl font-bold text-center border border-red-100">
            {error}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
