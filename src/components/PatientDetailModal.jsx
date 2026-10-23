import React, { useState } from 'react';
import { useFacility } from '../context/FacilityContext';
import { 
  X, 
  Bed, 
  Thermometer, 
  Stethoscope, 
  Award, 
  Clock, 
  Calendar, 
  Pill, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Flame, 
  Check, 
  Building2,
  TrendingDown,
  Activity,
  HeartCrack
} from 'lucide-react';
import { FEVER_THRESHOLD_C, isFever, cToF } from '../data/mockData';

export default function PatientDetailModal({ patientId, onClose, onOpenTempModal, onOpenDoctorModal }) {
  const { 
    patients, 
    tempUnit, 
    doctorApproveDischarge, 
    processDischarge 
  } = useFacility();

  const [activeTab, setActiveTab] = useState('chart'); // 'chart', 'logs', 'clinical'
  const [showDeceaseConfirm, setShowDeceaseConfirm] = useState(false);

  const patient = patients.find(p => p.id === patientId);
  if (!patient || patient.status === 'VACANT') return null;

  const displayTemp = (tempC) => {
    if (!tempC) return '--';
    return tempUnit === 'F' ? `${cToF(tempC)}°F` : `${tempC.toFixed(1)}°C`;
  };

  const logs = patient.tempLogs || [];
  const latestLog = logs[logs.length - 1];
  const hasFeverToday = latestLog ? isFever(latestLog.tempC) : false;
  const is3DayAfebrile = patient.feverFreeStreak >= 3;
  const isDoctorApproved = patient.dischargeStatus === 'DOCTOR_APPROVED';

  // SVG Chart Dimensions
  const chartHeight = 160;
  const chartWidth = 500;
  const minTemp = 36.0;
  const maxTemp = 40.5;

  const getY = (tempC) => {
    const clamped = Math.min(Math.max(tempC, minTemp), maxTemp);
    const ratio = (clamped - minTemp) / (maxTemp - minTemp);
    return chartHeight - ratio * chartHeight;
  };

  const thresholdY = getY(FEVER_THRESHOLD_C);

  // Generate SVG path for temperature trend line
  const points = logs.map((log, idx) => {
    const x = logs.length > 1 ? (idx / (logs.length - 1)) * (chartWidth - 60) + 30 : chartWidth / 2;
    const y = getY(log.tempC);
    return { x, y, tempC: log.tempC, date: log.date };
  });

  const pathD = points.length > 1 
    ? points.reduce((acc, pt, idx) => idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`, '')
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-black px-2.5 py-1 rounded-lg bg-blue-600 text-white shadow-sm">
              Room {patient.roomNumber}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{patient.name}</h3>
                <span className="text-xs text-slate-400">({patient.age}y • {patient.gender})</span>
              </div>
              <p className="text-xs text-slate-400">{patient.wing} • Admitted {patient.admissionDate} (Stay Day {patient.daysInFacility})</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Day Fever-Free Visual Streak Tracker */}
        <div className="bg-gradient-to-r from-slate-50 to-amber-50/50 p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Award className={`w-5 h-5 ${is3DayAfebrile ? 'text-amber-500' : 'text-slate-400'}`} />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                3-Day Afebrile Discharge Status
              </span>
            </div>
            <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
              is3DayAfebrile ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-200 text-slate-700'
            }`}>
              {patient.feverFreeStreak} / 3 Days Streak
            </span>
          </div>

          {/* Progress Steps */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(step => {
              const isAchieved = patient.feverFreeStreak >= step;
              return (
                <div 
                  key={step} 
                  className={`p-2.5 rounded-xl border text-center transition ${
                    isAchieved 
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm' 
                      : 'bg-white text-slate-400 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 font-extrabold text-xs">
                    {isAchieved ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Clock className="w-4 h-4 text-slate-300" />}
                    <span>Day {step} Afebrile</span>
                  </div>
                  <span className={`text-[10px] mt-0.5 block ${isAchieved ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {isAchieved ? '&lt; 38.0°C Confirmed' : 'Pending measurement'}
                  </span>
                </div>
              );
            })}
          </div>

          {is3DayAfebrile && (
            <div className="mt-2.5 p-2 bg-amber-100/70 border border-amber-300 rounded-lg flex items-center justify-between text-xs text-amber-900 font-bold">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Discharge Criterion Met! Patient is clinically cured of prolonged fever.
              </span>
              <span className="text-[10px] bg-amber-600 text-white px-2 py-0.5 rounded">
                {isDoctorApproved ? 'Awaiting Bed Release' : 'Awaiting Doctor Sign-off'}
              </span>
            </div>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('chart')}
            className={`py-2.5 px-3 border-b-2 transition ${
              activeTab === 'chart' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Temperature Trend Curve
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-2.5 px-3 border-b-2 transition ${
              activeTab === 'logs' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Daily Temperature Logs ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('clinical')}
            className={`py-2.5 px-3 border-b-2 transition ${
              activeTab === 'clinical' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Physician Orders & Rx
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: SVG Temperature Trend Curve */}
          {activeTab === 'chart' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Fever cutoff: <strong className="text-rose-600">38.0°C (100.4°F)</strong></span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Fever
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Afebrile
                  </span>
                </div>
              </div>

              {/* Responsive SVG Chart */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative overflow-hidden">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`} className="w-full h-44 overflow-visible">
                  {/* Grid Lines */}
                  {[36.5, 37.0, 37.5, 38.0, 38.5, 39.0, 39.5, 40.0].map(temp => {
                    const y = getY(temp);
                    const isFeverLine = temp === 38.0;
                    return (
                      <g key={temp}>
                        <line 
                          x1="20" 
                          y1={y} 
                          x2={chartWidth - 20} 
                          y2={y} 
                          stroke={isFeverLine ? "#f43f5e" : "#e2e8f0"} 
                          strokeWidth={isFeverLine ? "2" : "1"}
                          strokeDasharray={isFeverLine ? "4 4" : "none"}
                        />
                        <text x="5" y={y + 3} fontSize="9" fill={isFeverLine ? "#e11d48" : "#94a3b8"} fontWeight={isFeverLine ? "bold" : "normal"}>
                          {temp.toFixed(1)}°
                        </text>
                      </g>
                    );
                  })}

                  {/* Fever threshold label */}
                  <text x={chartWidth - 95} y={thresholdY - 5} fontSize="9" fontWeight="bold" fill="#e11d48">
                    Fever Threshold
                  </text>

                  {/* Temperature Curve Line */}
                  {pathD && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Data Point Circles */}
                  {points.map((pt, idx) => {
                    const isPtFever = pt.tempC >= FEVER_THRESHOLD_C;
                    return (
                      <g key={idx}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="5"
                          fill={isPtFever ? "#ef4444" : "#10b981"}
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                        <text
                          x={pt.x}
                          y={pt.y - 8}
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                          fill={isPtFever ? "#dc2626" : "#059669"}
                        >
                          {displayTemp(pt.tempC)}
                        </text>
                        <text
                          x={pt.x}
                          y={chartHeight + 20}
                          fontSize="9"
                          fill="#64748b"
                          textAnchor="middle"
                        >
                          {pt.date}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900">
                <span className="font-bold">Clinical Trajectory:</span> Patient has completed {logs.length} logged days of quarantine care. Current reading: <strong>{latestLog ? displayTemp(latestLog.tempC) : '--'}</strong>.
              </div>
            </div>
          )}

          {/* TAB 2: Daily Temperature Logs Table */}
          {activeTab === 'logs' && (
            <div className="space-y-2">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Temp</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Logged By</th>
                    <th className="py-2 px-3">Observations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log, idx) => {
                    const hasFever = isFever(log.tempC);
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-semibold text-slate-700">{log.date}</td>
                        <td className="py-2 px-3 font-extrabold">{displayTemp(log.tempC)}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            hasFever ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {hasFever ? 'Fever' : 'Afebrile'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-600">{log.recordedBy || 'Nurse'}</td>
                        <td className="py-2 px-3 text-slate-500 max-w-xs truncate">{log.notes || '--'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: Physician Orders & Rx */}
          {activeTab === 'clinical' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Last Physician Round Notes
                </span>
                <p className="text-slate-800 italic">
                  "{patient.doctorNotes || 'No notes entered yet for today.'}"
                </p>
                <span className="text-[10px] text-slate-400 mt-2 block">
                  Physician: {patient.doctorName || 'Dr. Chen'} • Visited at: {patient.lastVisitedTime || 'Pending today'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
                  Current Medications & Therapeutic Protocol
                </span>
                <div className="space-y-1">
                  {patient.currentMedications.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-indigo-50/50 border border-indigo-100 text-indigo-900 font-medium">
                      <Pill className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions Panel */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          
          {/* Quick Round Action Launchers */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenTempModal(patient);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
            >
              <Thermometer className="w-3.5 h-3.5" />
              <span>Log Temp</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenDoctorModal(patient);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Doctor Visit</span>
            </button>
          </div>

          {/* Discharge or Outcome Handlers */}
          <div className="flex items-center gap-2">
            {is3DayAfebrile && !isDoctorApproved && (
              <button
                onClick={() => {
                  doctorApproveDischarge(patient.id, 'Dr. Chen');
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-xs transition"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Doctor Approve Discharge</span>
              </button>
            )}

            {isDoctorApproved && (
              <button
                onClick={() => {
                  processDischarge(patient.id, 'CURED', 'Completed 3-day afebrile quarantine protocol');
                  onClose();
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-xs transition"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Admin Release Bed</span>
              </button>
            )}

            {/* Deceased Outcome (Updates Mortality Benchmark) */}
            {!showDeceaseConfirm ? (
              <button
                onClick={() => setShowDeceaseConfirm(true)}
                className="text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition"
              >
                Report Deceased
              </button>
            ) : (
              <div className="flex items-center gap-1 bg-rose-100 p-1 rounded-lg">
                <span className="text-[10px] text-rose-800 font-bold px-1">Confirm Deceased?</span>
                <button
                  onClick={() => {
                    processDischarge(patient.id, 'DECEASED', 'Multi-organ failure / severe viral complications');
                    onClose();
                  }}
                  className="px-2 py-0.5 bg-rose-600 text-white text-xs font-bold rounded"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowDeceaseConfirm(false)}
                  className="px-2 py-0.5 text-xs text-slate-600"
                >
                  No
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
