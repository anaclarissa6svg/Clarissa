
export enum RecoveryPhase {
  ACUTE = 'Aguda (PEACE & LOVE / Protección)',
  SUBACUTE = 'Subaguda (Carga Progresiva)',
  STRENGTHENING = 'Fortalecimiento (Resistencia Mecánica)',
  RETURN_TO_SPORT = 'Retorno (Control Sensoriomotor)'
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  sets: number;
  reps: number;
  duration?: string;
  frequency: string;
  rest: string;
  tips: string[];
  muscleGroup: string;
  difficulty: 'Baja' | 'Media' | 'Alta';
  warnings: string[];
}

export interface Diagnosis {
  area: string;
  condition: string;
  phase: RecoveryPhase;
  notes: string;
}

export interface Session {
  id: string;
  date: string;
  painLevel: number; // 0-10
  patientFeedback: string;
  routine: Routine;
  clinicalDecision: 'Progresión' | 'Mantenimiento' | 'Regresión/Adaptación';
}

export interface Patient {
  id: string;
  name: string;
  diagnosis: Diagnosis;
  sessions: Session[];
}

export interface Routine {
  exercises: Exercise[];
  rationale: string;
  totalDuration: string;
  references: string[];
  evidenceLevel: string;
}
