import React, { useState } from 'react';
import { useFacility } from '../context/FacilityContext';
import { 
  X, 
  Stethoscope, 
  AlertTriangle, 
  CheckCircle2, 
  Thermometer, 
  Award, 
  Pill, 
  Sparkles,
  Flame,
  Check
} from 'lucide-react';
import { isFever, cToF } from '../data/mockData';

const AVAILABLE_MEDS = [
  "Antiviral (Remdesivir 100mg IV)",
  "Hydration IV (Normal Saline 1L)",
  "Paracetamol 500mg PO (PRN)",
  "Supplemental O2 (2L/min Nasal Cannula)",
  "Electrolyte Balance Sachet",
  "Antibiotic Coverage (Amoxicillin/Clav)",
  "Vitamin C & Zinc Supplement"
];

export default function DoctorVisitModal({ patient, onClose, onSwitchToTempModal }) {
  const { recordDoctorVisit, tempUnit } = useFacility();

  const [doctorName, setDoctorName] = useState('Dr. Chen (Attending Physician)');
  const [notes, setNotes] = useState(patient?.doctorNotes || 'Patient examined. Lungs clear, responsive, vitals stable.');
  const [selectedMeds, setSelectedMeds] = useState(patient?.currentMedications || ["Hydration IV", "Remdesivir / Antiviral"]);
  const [approveDischarge, setApproveDischarge] = useState(patient?.feverFreeStreak >= 3);

  if (!patient) return null;

  const todayLog = patient.tempLogs[patient.tempLogs.length - 1];
  const hasTempToday = patient.isTempTakenToday && todayLog;
  const tempHasFever = hasTempToday ? isFever(todayLog.tempC) : false;
  const isEligibleForDischarge = patient.feverFreeStreak >= 3;

  const displayTemp = (tempC) => {
    if (!tempC) return '--';
    return tempUnit === 'F' ? `${cToF(tempC)}°F` : `${tempC.toFixed(1)}°C`;
  };

  const toggleMed = (med) => {
    if (selectedMeds.includes(med)) {
      setSelectedMeds(selectedMeds.filter(m => m !== med));
    } else {
      setSelectedMeds([...selectedMeds, med]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    recordDoctorVisit(patient.id, {
      doctorName,
      notes,
      medications: selectedMeds,
      approveDischarge
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-indigo-700 to-blue-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Stethoscope className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <h3 className="font-bold text-base">Doctor Daily Clinical Visit</h3>
              <p className="text-xs text-indigo-200">
                Room {patient.roomNumber} • {patient.name} ({patient.age}y • Stay Day {patient.daysInFacility})
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

        {/* Temperature Coordination Check: Directly solves doctor workflow bottleneck */}
        {!hasTempToday ? (
          <div className="bg-amber-50 border-b border-amber-200 p-3.5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 flex-1">
              <p className="font-bold">Workflow Notice: Morning Temperature Not Recorded Yet!</p>
              <p className="mt-0.5 text-amber-800 leading-snug">
                Nurses have not yet logged today's temperature for Room {patient.roomNumber}. To prevent delays during rounds, doctors typically prioritize patients with recorded temperatures first.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToTempModal(patient);
                }}
                className="mt-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded-md shadow-xs transition"
              >
                Log Nurse Temperature Now Instead
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl flex items-center justify-center ${
                tempHasFever ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {tempHasFever ? <Flame className="w-5 h-5" /> : <Check className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Today's Morning Temperature Logged
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-black ${tempHasFever ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {displayTemp(todayLog.tempC)}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    tempHasFever ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {tempHasFever ? 'Fever Present' : 'Afebrile (Normal)'}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right text-[11px] text-slate-500">
              <span>Logged by: <strong>{todayLog.recordedBy || 'Nurse'}</strong></span>
              <span className="block text-[10px] text-slate-400">{todayLog.timestamp || 'Morning Round'}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Attending Physician */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
              Examining Physician
            </label>
            <input
              type="text"
              required
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              className="w-full text-xs font-medium text-slate-800 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Clinical Findings & Treatment Plan */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
              Physician Round Notes & Clinical Evaluation
            </label>
            <textarea
              rows="3"
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record respiratory status, symptom progression, hydration assessment, and therapeutic response..."
              className="w-full text-xs text-slate-800 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Prescribed Medications / Treatment */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
              Administered / Prescribed Treatment Regimen
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {AVAILABLE_MEDS.map(med => {
                const isSelected = selectedMeds.includes(med);
                return (
                  <label
                    key={med}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition ${
                      isSelected ? 'bg-indigo-50/70 border-indigo-300 text-indigo-900 font-medium' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleMed(med)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="truncate">{med}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 3-Day Fever-Free Automatic Discharge Authorization */}
          <div className={`p-3.5 rounded-xl border ${
            isEligibleForDischarge 
              ? 'bg-amber-50/80 border-amber-300 ring-1 ring-amber-300' 
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-start gap-2.5">
              <Award className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isEligibleForDischarge ? 'text-amber-600' : 'text-slate-400'}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    3-Day Fever-Free Discharge Protocol
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    isEligibleForDischarge ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {patient.feverFreeStreak}/3 Days Afebrile
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 mt-1">
                  {isEligibleForDischarge 
                    ? "Patient has completed 3 consecutive days without fever! Authorize discharge below to notify admin staff and initiate bed turnover."
                    : "Patient does not yet satisfy the 3 full days fever-free criterion required for safe release."}
                </p>

                {isEligibleForDischarge && (
                  <label className="flex items-center gap-2 mt-2 pt-2 border-t border-amber-200/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={approveDischarge}
                      onChange={(e) => setApproveDischarge(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="text-xs font-black text-emerald-900">
                      Approve Clinical Discharge & Transmit to Admin Queue
                    </span>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
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
              className="px-5 py-2 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition active:scale-95 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Visit & Complete Round</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
