import React, { useState } from 'react';
import { useFacility } from '../context/FacilityContext';
import { 
  Thermometer, 
  Stethoscope, 
  CheckCircle2, 
  Award, 
  Search, 
  Filter, 
  Clock, 
  AlertTriangle, 
  ChevronRight, 
  Plus, 
  Flame, 
  Check, 
  UserCheck, 
  Building2,
  Sparkles
} from 'lucide-react';
import { isFever, cToF } from '../data/mockData';

export default function DailyWorkflowBoard({ onOpenTempModal, onOpenDoctorModal, onOpenPatientDetails }) {
  const { 
    patients, 
    activePatients, 
    tempUnit, 
    activeRole, 
    doctorApproveDischarge, 
    processDischarge 
  } = useFacility();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWing, setSelectedWing] = useState('ALL');

  // Filter patients
  const filteredPatients = activePatients.filter(patient => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.roomNumber.toString().includes(searchQuery) ||
      patient.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesWing = 
      selectedWing === 'ALL' ||
      (selectedWing === 'A' && patient.roomNumber <= 25) ||
      (selectedWing === 'B' && patient.roomNumber > 25 && patient.roomNumber <= 50) ||
      (selectedWing === 'C' && patient.roomNumber > 50);

    return matchesSearch && matchesWing;
  });

  // Categorize into the 4 Workflow Columns
  const pendingTempPatients = filteredPatients.filter(p => !p.isTempTakenToday && p.dischargeStatus === 'NOT_READY');
  const readyForDoctorPatients = filteredPatients.filter(p => p.isTempTakenToday && !p.isDoctorVisitedToday && p.dischargeStatus === 'NOT_READY');
  const completedTodayPatients = filteredPatients.filter(p => p.isTempTakenToday && p.isDoctorVisitedToday && p.dischargeStatus === 'NOT_READY');
  const dischargeReadyPatients = filteredPatients.filter(p => p.feverFreeStreak >= 3 || p.dischargeStatus !== 'NOT_READY');

  const displayTemp = (tempC) => {
    if (!tempC) return '--';
    return tempUnit === 'F' ? `${cToF(tempC)}°F` : `${tempC.toFixed(1)}°C`;
  };

  return (
    <div className="space-y-4">
      
      {/* Workflow Explanation & Control Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800">Daily Rounds Coordination Board</h2>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
              Live Synchronized Workflow
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Solves duplicate/missed temperature checks and prevents doctors visiting before morning temperatures are recorded.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search room or patient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          {/* Wing Selector */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setSelectedWing('ALL')}
              className={`px-2.5 py-1 rounded ${selectedWing === 'ALL' ? 'bg-white shadow text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All Wings
            </button>
            <button
              onClick={() => setSelectedWing('A')}
              className={`px-2.5 py-1 rounded ${selectedWing === 'A' ? 'bg-white shadow text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Wing A (1-25)
            </button>
            <button
              onClick={() => setSelectedWing('B')}
              className={`px-2.5 py-1 rounded ${selectedWing === 'B' ? 'bg-white shadow text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Wing B (26-50)
            </button>
            <button
              onClick={() => setSelectedWing('C')}
              className={`px-2.5 py-1 rounded ${selectedWing === 'C' ? 'bg-white shadow text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Wing C (51-74)
            </button>
          </div>
        </div>
      </div>

      {/* 4 Workflow Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

        {/* ================= COLUMN 1: PENDING TEMPERATURE ================= */}
        <div className={`flex flex-col bg-slate-100/70 rounded-xl border ${activeRole === 'NURSE' ? 'ring-2 ring-emerald-500 border-emerald-300' : 'border-slate-200'} p-3 max-h-[750px]`}>
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200/80">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Thermometer className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">1. Pending Temp</h3>
                <p className="text-[10px] text-slate-500">Nurse Action Required</p>
              </div>
            </div>
            <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              {pendingTempPatients.length}
            </span>
          </div>

          <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
            {pendingTempPatients.length === 0 ? (
              <div className="text-center py-10 bg-white/60 rounded-lg border border-dashed border-slate-200 p-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">All Temperatures Recorded!</p>
                <p className="text-[11px] text-slate-500 mt-1">No rooms are currently waiting for nurse measurements.</p>
              </div>
            ) : (
              pendingTempPatients.map(patient => {
                const latestLog = patient.tempLogs[patient.tempLogs.length - 1];
                return (
                  <div 
                    key={patient.id}
                    className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                          Room {patient.roomNumber}
                        </span>
                        <span className="text-[10px] text-slate-400">{patient.wing.split(' ')[0]}</span>
                      </div>
                      <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50">
                        Temp Needed
                      </span>
                    </div>

                    <div className="mt-2" onClick={() => onOpenPatientDetails(patient.id)}>
                      <h4 className="text-xs font-bold text-slate-800 hover:text-blue-600 cursor-pointer flex items-center justify-between">
                        <span>{patient.name}</span>
                        <span className="text-[10px] font-normal text-slate-400">{patient.age}y • {patient.gender}</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Stay: <strong>Day {patient.daysInFacility}</strong> • Last reading: {latestLog ? displayTemp(latestLog.tempC) : 'None'}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onOpenTempModal(patient)}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition active:scale-95"
                      >
                        <Thermometer className="w-3.5 h-3.5" />
                        <span>Log Temp</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ================= COLUMN 2: READY FOR DOCTOR VISIT ================= */}
        <div className={`flex flex-col bg-slate-100/70 rounded-xl border ${activeRole === 'DOCTOR' ? 'ring-2 ring-indigo-500 border-indigo-300' : 'border-slate-200'} p-3 max-h-[750px]`}>
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200/80">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">2. Ready for Doctor</h3>
                <p className="text-[10px] text-indigo-600 font-semibold">Morning Temp Available</p>
              </div>
            </div>
            <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
              {readyForDoctorPatients.length}
            </span>
          </div>

          <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
            {readyForDoctorPatients.length === 0 ? (
              <div className="text-center py-10 bg-white/60 rounded-lg border border-dashed border-slate-200 p-4">
                <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No Patients in Waiting Queue</p>
                <p className="text-[11px] text-slate-500 mt-1">Nurses will log temperatures to queue patients for doctor examination.</p>
              </div>
            ) : (
              readyForDoctorPatients.map(patient => {
                const todayLog = patient.tempLogs[patient.tempLogs.length - 1];
                const hasFever = todayLog ? isFever(todayLog.tempC) : false;

                return (
                  <div 
                    key={patient.id}
                    className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                          Room {patient.roomNumber}
                        </span>
                        <span className="text-[10px] text-slate-400">{patient.wing.split(' ')[0]}</span>
                      </div>
                      
                      {/* Today's Temperature Badge */}
                      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md border ${
                        hasFever 
                          ? 'bg-rose-50 text-rose-700 border-rose-200' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {hasFever ? <Flame className="w-3.5 h-3.5 text-rose-500" /> : <Check className="w-3.5 h-3.5 text-emerald-500" />}
                        <span>{todayLog ? displayTemp(todayLog.tempC) : '--'}</span>
                      </div>
                    </div>

                    <div className="mt-2" onClick={() => onOpenPatientDetails(patient.id)}>
                      <h4 className="text-xs font-bold text-slate-800 hover:text-indigo-600 cursor-pointer flex items-center justify-between">
                        <span>{patient.name}</span>
                        <span className="text-[10px] font-normal text-slate-400">{patient.age}y • {patient.gender}</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Fever-free streak: <strong>{patient.feverFreeStreak}/3 days</strong> • Temp by {todayLog?.recordedBy || 'Nurse'}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onOpenDoctorModal(patient)}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition active:scale-95"
                      >
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span>Doctor Visit & Rx</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ================= COLUMN 3: ROUNDS COMPLETED TODAY ================= */}
        <div className="flex flex-col bg-slate-100/70 rounded-xl border border-slate-200 p-3 max-h-[750px]">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200/80">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">3. Complete Today</h3>
                <p className="text-[10px] text-slate-500">Nurse & Doctor Visited</p>
              </div>
            </div>
            <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              {completedTodayPatients.length}
            </span>
          </div>

          <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
            {completedTodayPatients.length === 0 ? (
              <div className="text-center py-10 bg-white/60 rounded-lg border border-dashed border-slate-200 p-4">
                <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No Completed Visits Yet</p>
                <p className="text-[11px] text-slate-500 mt-1">Rooms will appear here after both nurse temp and doctor visit are finished.</p>
              </div>
            ) : (
              completedTodayPatients.map(patient => {
                const todayLog = patient.tempLogs[patient.tempLogs.length - 1];
                const hasFever = todayLog ? isFever(todayLog.tempC) : false;

                return (
                  <div 
                    key={patient.id}
                    onClick={() => onOpenPatientDetails(patient.id)}
                    className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                          Room {patient.roomNumber}
                        </span>
                        <span className="text-[10px] text-slate-400">{patient.name}</span>
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                        hasFever ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {todayLog ? displayTemp(todayLog.tempC) : '--'}
                      </span>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-600 line-clamp-2 italic bg-slate-50 p-2 rounded border border-slate-100">
                      "{patient.doctorNotes || 'Patient evaluated and stable.'}"
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Seen by: {patient.doctorName || 'Dr. Chen'}</span>
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Done for today
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ================= COLUMN 4: 3-DAY FEVER-FREE DISCHARGE QUEUE ================= */}
        <div className={`flex flex-col bg-amber-50/50 rounded-xl border-2 ${activeRole === 'ADMIN' ? 'border-amber-400 ring-2 ring-amber-400' : 'border-amber-300'} p-3 max-h-[750px]`}>
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-amber-200/80">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-sm">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-900">4. 3-Day Fever-Free</h3>
                <p className="text-[10px] text-amber-700 font-semibold">Ready for Discharge</p>
              </div>
            </div>
            <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-sm">
              {dischargeReadyPatients.length}
            </span>
          </div>

          <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
            {dischargeReadyPatients.length === 0 ? (
              <div className="text-center py-10 bg-white/80 rounded-lg border border-dashed border-amber-200 p-4">
                <Award className="w-8 h-8 text-amber-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No Discharge Candidates Yet</p>
                <p className="text-[11px] text-slate-500 mt-1">Patients will automatically be elevated here upon completing 3 consecutive afebrile days.</p>
              </div>
            ) : (
              dischargeReadyPatients.map(patient => {
                const isApproved = patient.dischargeStatus === 'DOCTOR_APPROVED';

                return (
                  <div 
                    key={patient.id}
                    className="bg-white p-3 rounded-xl border border-amber-200 shadow-md hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                          Room {patient.roomNumber}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{patient.name}</span>
                      </div>
                      <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>3/3 Afebrile</span>
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-2">
                      Stayed: <strong>{patient.daysInFacility} days</strong> • Cured criteria satisfied!
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5">
                      {isApproved ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                            <Check className="w-3.5 h-3.5" />
                            <span>Dr. Approved • Awaiting Admin Release</span>
                          </div>
                          <button
                            onClick={() => processDischarge(patient.id, 'CURED', 'Completed 3-day afebrile quarantine protocol')}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow transition active:scale-95"
                          >
                            <Building2 className="w-3.5 h-3.5" />
                            <span>Admin Release & Free Bed</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Pending Doctor Discharge Sign-off
                          </div>
                          <button
                            onClick={() => doctorApproveDischarge(patient.id, 'Dr. Chen')}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow transition active:scale-95"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Doctor 1-Click Discharge</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
