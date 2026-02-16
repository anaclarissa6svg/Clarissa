
import { GoogleGenAI, Type } from "@google/genai";
import { Diagnosis, Routine, Patient, Session } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const routineSchema = {
  type: Type.OBJECT,
  properties: {
    exercises: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          sets: { type: Type.INTEGER },
          reps: { type: Type.INTEGER },
          duration: { type: Type.STRING },
          frequency: { type: Type.STRING },
          rest: { type: Type.STRING },
          tips: { type: Type.ARRAY, items: { type: Type.STRING } },
          muscleGroup: { type: Type.STRING },
          difficulty: { type: Type.STRING },
          warnings: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["id", "name", "description", "sets", "reps", "frequency", "rest", "tips", "muscleGroup", "difficulty", "warnings"]
      }
    },
    rationale: { type: Type.STRING },
    totalDuration: { type: Type.STRING },
    references: { type: Type.ARRAY, items: { type: Type.STRING } },
    evidenceLevel: { type: Type.STRING },
    clinicalDecision: { 
      type: Type.STRING, 
      description: "Decisión técnica: Progresión, Mantenimiento o Regresión/Adaptación" 
    }
  },
  required: ["exercises", "rationale", "totalDuration", "references", "evidenceLevel", "clinicalDecision"]
};

export async function generateSessionRoutine(
  patient: Patient, 
  currentPain: number, 
  currentFeedback: string
): Promise<{ routine: Routine, decision: string }> {
  const historyText = patient.sessions.map(s => 
    `- Fecha: ${s.date}, Dolor: ${s.painLevel}/10, Decisión previa: ${s.clinicalDecision}`
  ).join('\n');

  const prompt = `
    Eres un Fisioterapeuta Especialista. Debes generar la siguiente sesión de tratamiento para el paciente "${patient.name}".
    
    DIAGNÓSTICO INICIAL:
    - Área: ${patient.diagnosis.area}
    - Condición: ${patient.diagnosis.condition}
    - Fase actual: ${patient.diagnosis.phase}
    
    ESTADO ACTUAL DE LA SESIÓN:
    - Dolor reportado hoy: ${currentPain}/10 (Escala EVA)
    - Comentarios del paciente: ${currentFeedback}
    
    HISTORIAL DE SESIONES PREVIAS:
    ${historyText || "No hay sesiones previas."}

    CRITERIOS CLÍNICOS OBLIGATORIOS:
    1. Si el dolor es > 4/10 o ha aumentado respecto a la sesión anterior, considera "Regresión/Adaptación" o "Mantenimiento".
    2. Si el dolor es < 2/10 y el feedback es positivo, busca "Progresión" de carga (más reps, menos rest, o ejercicios más complejos).
    3. Fundamenta tu decisión en Guías de Práctica Clínica (JOSPT/BJSM).
    
    Responde en JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: routineSchema,
        thinkingConfig: { thinkingBudget: 8000 }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      routine: {
        exercises: result.exercises,
        rationale: result.rationale,
        totalDuration: result.totalDuration,
        references: result.references,
        evidenceLevel: result.evidenceLevel
      },
      decision: result.clinicalDecision
    };
  } catch (error) {
    console.error("Error generating session:", error);
    throw error;
  }
}
