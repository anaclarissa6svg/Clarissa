
import React from 'react';
import { Exercise } from '../types';

interface ExerciseCardProps {
  exercise: Exercise;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full mb-2">
            {exercise.muscleGroup}
          </span>
          <h3 className="text-xl font-bold text-slate-800">{exercise.name}</h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-slate-800">{exercise.sets}x{exercise.reps}</div>
          <div className="text-xs text-slate-500 font-medium">Descanso: {exercise.rest}</div>
        </div>
      </div>

      <p className="text-slate-600 text-sm mb-6 leading-relaxed">
        {exercise.description}
      </p>

      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Instrucciones</h4>
          <ul className="space-y-2">
            {exercise.tips.map((tip, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-sm text-slate-700">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {exercise.warnings.length > 0 && (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
            <div className="flex items-center space-x-2 text-amber-700 mb-1">
              <span className="text-sm">⚠️</span>
              <span className="text-xs font-bold uppercase tracking-tight">Atención</span>
            </div>
            {exercise.warnings.map((w, idx) => (
              <p key={idx} className="text-xs text-amber-800 leading-snug">{w}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
