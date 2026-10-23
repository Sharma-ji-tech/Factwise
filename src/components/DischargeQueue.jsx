import React, { useState } from 'react';
import { useFacility } from '../context/FacilityContext';
import { 
  Award, 
  CheckCircle2, 
  Building2, 
  UserCheck, 
  Bed, 
  PlusCircle, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import { cToF } from '../data/mockData';

export default function DischargeQueue({ onOpenPatientDetails, onOpenAdmitModal }) {
  const { 
    patients, 
    activePatients, 
    vacantRooms, 
    doctorApproveDischarge, 
    processDischarge, 
    tempUnit,
    history
  } = useFacility();

  const [dischargeNotes, setDischargeNotes] = useState({});

  const displayTemp = (tempC) => {
    if (!tempC) return '--';
    return tempUnit === 'F' ? `${cToF(tempC)}°F` : `${tempC.toFixed(1)}°C`;
  };

  // Patients eligible for doctor sign-off (3+ days afebrile, not yet signed off)
  const pendingDoctorApproval = activePatients.filter(
    p => p.feverFreeStreak >= 3 && p.dischargeStatus === 'ELIGIBLE_PENDING_DOCTOR'
  );

  // Patients approved by doctor, waiting for admin bed release
  const readyForAdminRelease = activePatients.filter(
    p => p.dischargeStatus === 'DOCTOR_APPROVED'
  );

  const handleNoteChange = (patientId, val) => {
    setDischargeNotes(prev => ({ ...prev, [patientId]: val }));
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-700 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
                <Award className="w-5 h-5 text-amber-200" />
              </span>
              <h2 className="text-xl font-black tracking-tight">3-Day Fever-Free Discharge Administration</h2>
            </div>
            <p className="text-sm text-amber-100 max-w-2xl leading-relaxed">
              Standardized Discharge Rule: Patients afebrile (&lt;38.0°C / &lt;100.4°F) for 3 full consecutive days are automatically queued for discharge to eliminate delays and immediately free beds for waiting patients.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20">
            <div className="text-center">
              <span className="text-2xl font-black block">{pendingDoctorApproval.length + readyForAdminRelease.length}</span>
              <span className="text-[10px] uppercase font-bold text-amber-200">Pending Discharges</span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <span className="text-2xl font-black block">{history.dischargedCured}</span>
              <span className="text-[10px] uppercase font-bold text-emerald-200">Total Cured to Date</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Stage Discharge Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ================= STEP 1: DOCTOR CLINICAL SIGNOFF ================= */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Awaiting Doctor Clinical Sign-off</h3>
                <p className="text-xs text-slate-500">3-day criterion met • Requires physician verification</p>
              </div>
            </div>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
              {pendingDoctorApproval.length} Candidates
            </span>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[500px]">
            {pendingDoctorApproval.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">No Pending Clinical Sign-offs</p>
                <p className="text-[11px] text-slate-400 mt-0.5">All afebrile patients have been reviewed by a doctor.</p>
              </div>
            ) : (
              pendingDoctorApproval.map(patient => {
                const logs = patient.tempLogs.slice(-3);
                return (
                  <div 
                    key={patient.id}
                    className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/20 hover:border-indigo-300 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-900 text-white">
                            Room {patient.roomNumber}
                          </span>
                          <span className="text-sm font-bold text-slate-800">{patient.name}</span>
                          <span className="text-xs text-slate-400">({patient.age}y • {patient.gender})</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Admitted: {patient.admissionDate} • Stay length: <strong>{patient.daysInFacility} days</strong>
                        </p>
                      </div>

                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{patient.feverFreeStreak} Days Afebrile</span>
                      </span>
                    </div>

                    {/* 3-day readings proof */}
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                        3-Day Afebrile Verification
                      </span>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        {logs.map((log, idx) => (
                          <div key={idx} className="bg-emerald-50/60 p-1.5 rounded border border-emerald-200/60">
                            <span className="text-[10px] text-slate-500 block">{log.date}</span>
                            <span className="font-extrabold text-emerald-700">{displayTemp(log.tempC)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <button
                        onClick={() => onOpenPatientDetails(patient.id)}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
                      >
                        Inspect Full Dossier
                      </button>

                      <button
                        onClick={() => doctorApproveDischarge(patient.id, 'Dr. Chen')}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow transition active:scale-95"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Authorize Clinical Discharge</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ================= STEP 2: ADMIN BED RELEASE & SANITIZE ================= */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Admin Bed Release & Discharge Finalization</h3>
                <p className="text-xs text-slate-500">Doctor authorized • Free bed & update benchmark registry</p>
              </div>
            </div>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
              {readyForAdminRelease.length} Ready
            </span>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[500px]">
            {readyForAdminRelease.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Building2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">Admin Discharge Queue Clear</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Approved patients will instantly pop up here for bed turnover.</p>
              </div>
            ) : (
              readyForAdminRelease.map(patient => (
                <div 
                  key={patient.id}
                  className="p-3.5 rounded-xl border border-purple-100 bg-purple-50/20 hover:border-purple-300 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black px-2 py-0.5 rounded-md bg-purple-600 text-white">
                          Room {patient.roomNumber}
                        </span>
                        <span className="text-sm font-bold text-slate-800">{patient.name}</span>
                      </div>
                      <p className="text-xs text-purple-700 font-semibold mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                        <span>Signed off by {patient.doctorName || 'Attending Physician'}</span>
                      </p>
                    </div>

                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                      Discharge Approved
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Physician Notes
                    </span>
                    <p className="italic">{patient.doctorNotes || 'Afebrile 3 full consecutive days. Safe for community release.'}</p>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <span className="text-[11px] text-slate-500">
                      Releases bed immediately for admissions
                    </span>

                    <button
                      onClick={() => processDischarge(patient.id, 'CURED', 'Cured - 3-day afebrile criteria achieved')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black rounded-lg shadow transition active:scale-95"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Release Bed & Finalize Discharge</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Vacant Beds Ready for Admission */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2">
            <Bed className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-800">Vacant Rooms Available for Immediate Admission</h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 self-start sm:self-auto">
            {vacantRooms.length} Vacant of 74 Total Rooms
          </span>
        </div>

        {vacantRooms.length === 0 ? (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
            <span className="font-semibold">
              ⚠️ Facility at 100% full capacity (0 vacant rooms). Complete discharges above to free rooms for waiting patients.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
            {vacantRooms.map(room => (
              <button
                key={room.roomNumber}
                onClick={() => onOpenAdmitModal(room.roomNumber)}
                className="p-3 rounded-xl border border-dashed border-blue-300 hover:border-blue-600 bg-blue-50/30 hover:bg-blue-50 text-center transition group"
              >
                <span className="text-xs font-black text-slate-800 block">Room {room.roomNumber}</span>
                <span className="text-[10px] text-blue-600 font-bold flex items-center justify-center gap-0.5 mt-1 group-hover:underline">
                  <PlusCircle className="w-3 h-3" /> Admit
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
