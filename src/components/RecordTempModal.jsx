import React, { useState } from 'react';
import { useFacility } from '../context/FacilityContext';
import { 
  X, 
  Thermometer, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Sparkles,
  Info
} from 'lucide-react';
import { FEVER_THRESHOLD_C, isFever, cToF, fToC } from '../data/mockData';

const COMMON_SYMPTOMS = [
  "High Fever", "Chills", "Prolonged Fever", "Dry Cough", 
  "Fatigue", "Body Aches", "Headache", "Sweating", "Loss of Appetite", "None (Asymptomatic)"
];

export default function RecordTempModal({ patient, onClose }) {
  const { recordTemperature, tempUnit } = useFacility();

  // Initial temp in current unit
  const [tempInput, setTempInput] = useState('38.2');
  const [nurseName, setNurseName] = useState('Nurse Sarah');
  const [selectedSymptoms, setSelectedSymptoms] = useState(patient?.symptoms || ['Prolonged Fever']);
  const [notes, setNotes] = useState('');

  if (!patient) return null;

  // Calculate temp in Celsius for evaluation
  const numericVal = parseFloat(tempInput);
  const tempInC = tempUnit === 'F' ? (((numericVal - 32) * 5) / 9) : numericVal;
  const feverDetected = !isNaN(tempInC) && isFever(tempInC);

  const toggleSymptom = (sym) => {
    if (sym === "None (Asymptomatic)") {
      setSelectedSymptoms(["None (Asymptomatic)"]);
      return;
    }
    const filtered = selectedSymptoms.filter(s => s !== "None (Asymptomatic)");
    if (filtered.includes(sym)) {
      setSelectedSymptoms(filtered.filter(s => s !== sym));
    } else {
      setSelectedSymptoms([...filtered, sym]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isNaN(tempInC) || tempInC < 34 || tempInC > 43) {
      alert('Please enter a realistic temperature reading.');
      return;
    }

    const success = recordTemperature(patient.id, {
      tempC: tempInC,
      recordedBy: nurseName,
      notes,
      symptoms: selectedSymptoms
    });

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Thermometer className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-base">Record Patient Temperature</h3>
              <p className="text-xs text-emerald-100">
                Room {patient.roomNumber} • {patient.name} ({patient.age}y)
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning if already recorded today */}
        {patient.isTempTakenToday && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-start gap-2.5 text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Duplicate Measurement Prevention:</span> A temperature was already recorded for Room {patient.roomNumber} today. Logging again will update today's primary reading.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Temperature Input with Dynamic Evaluation */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Measured Temperature ({tempUnit === 'C' ? '°Celsius' : '°Fahrenheit'})
              </label>
              <span className="text-[11px] text-slate-500">
                Fever threshold: {tempUnit === 'C' ? '38.0°C' : '100.4°F'}
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                step="0.1"
                min={tempUnit === 'C' ? '34.0' : '93.2'}
                max={tempUnit === 'C' ? '43.0' : '109.4'}
                required
                value={tempInput}
                onChange={(e) => setTempInput(e.target.value)}
                className="w-full text-2xl font-black text-slate-800 px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 transition"
              />
              <span className="absolute right-4 top-3 text-lg font-bold text-slate-400">
                °{tempUnit}
              </span>
            </div>

            {/* Instant Fever Evaluation Badge */}
            <div className="mt-2">
              {!isNaN(tempInC) && (
                feverDetected ? (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-rose-700 text-xs font-bold">
                    <span className="flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-rose-600" />
                      FEVER DETECTED ({tempInC.toFixed(1)}°C)
                    </span>
                    <span className="text-[10px] font-semibold text-rose-600">
                      Resets 3-day afebrile streak
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-800 text-xs font-bold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      AFEBRILE / NORMAL ({tempInC.toFixed(1)}°C)
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700">
                      Counts toward 3-day cure criteria!
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Nurse Attending */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
              Nurse Name
            </label>
            <input
              type="text"
              required
              value={nurseName}
              onChange={(e) => setNurseName(e.target.value)}
              className="w-full text-xs font-medium text-slate-800 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Observable Symptoms */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
              Active Symptoms
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SYMPTOMS.map(s => {
                const isSelected = selectedSymptoms.includes(s);
                return (
                  <button
                    type="button"
                    key={s}
                    onClick={() => toggleSymptom(s)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                      isSelected 
                        ? 'bg-emerald-600 text-white border-emerald-600 font-semibold' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clinical Observations */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
              Nurse Round Notes / Observations
            </label>
            <textarea
              rows="2"
              placeholder="e.g., Patient took fluids well, resting comfortably, reported mild chills."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs text-slate-800 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Footer Action */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md transition active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record & Update Queue</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
