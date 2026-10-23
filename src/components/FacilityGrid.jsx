import React, { useState } from 'react';
import { useFacility } from '../context/FacilityContext';
import { 
  Bed, 
  Thermometer, 
  Stethoscope, 
  Award, 
  Search, 
  Flame, 
  Check, 
  PlusCircle, 
  Sparkles,
  User,
  Filter
} from 'lucide-react';
import { isFever, cToF } from '../data/mockData';

export default function FacilityGrid({ onOpenPatientDetails, onOpenAdmitModal, onOpenTempModal }) {
  const { 
    patients, 
    tempUnit, 
    TOTAL_ROOMS, 
    occupiedCount,
    dischargeEligibleCount
  } = useFacility();

  const [filterType, setFilterType] = useState('ALL'); // ALL, FEVER, NORMAL, NEEDS_TEMP, READY_DOC, DISCHARGE, VACANT
  const [searchQuery, setSearchQuery] = useState('');
  const [activeWing, setActiveWing] = useState('ALL');

  const displayTemp = (tempC) => {
    if (!tempC) return '--';
    return tempUnit === 'F' ? `${cToF(tempC)}°F` : `${tempC.toFixed(1)}°C`;
  };

  const filteredRooms = patients.filter(patient => {
    // Wing filter
    if (activeWing === 'A' && patient.roomNumber > 25) return false;
    if (activeWing === 'B' && (patient.roomNumber <= 25 || patient.roomNumber > 50)) return false;
    if (activeWing === 'C' && patient.roomNumber <= 50) return false;

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchRoom = patient.roomNumber.toString().includes(q);
      const matchName = patient.name.toLowerCase().includes(q);
      if (!matchRoom && !matchName) return false;
    }

    // Status filter
    if (filterType === 'ALL') return true;
    if (filterType === 'VACANT') return patient.status === 'VACANT';
    if (filterType === 'DISCHARGE') return patient.feverFreeStreak >= 3 || patient.dischargeStatus !== 'NOT_READY';
    if (filterType === 'NEEDS_TEMP') return patient.status === 'ACTIVE' && !patient.isTempTakenToday;
    if (filterType === 'READY_DOC') return patient.status === 'ACTIVE' && patient.isTempTakenToday && !patient.isDoctorVisitedToday;
    
    // Fever vs Normal filter
    const latestLog = patient.tempLogs[patient.tempLogs.length - 1];
    if (filterType === 'FEVER') {
      return patient.status === 'ACTIVE' && latestLog && isFever(latestLog.tempC);
    }
    if (filterType === 'NORMAL') {
      return patient.status === 'ACTIVE' && latestLog && !isFever(latestLog.tempC);
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Filter and Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800">74-Room Quarantine Capacity Grid</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {occupiedCount}/{TOTAL_ROOMS} Beds Occupied
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time visual map of all quarantine rooms across Wings A, B, and C.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Room # or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-44"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-2.5 py-1 rounded ${filterType === 'ALL' ? 'bg-white shadow text-slate-900 font-bold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All (74)
            </button>
            <button
              onClick={() => setFilterType('NEEDS_TEMP')}
              className={`px-2 py-1 rounded ${filterType === 'NEEDS_TEMP' ? 'bg-amber-100 text-amber-900 font-bold shadow' : 'text-slate-600 hover:text-amber-800'}`}
            >
              Pending Temp
            </button>
            <button
              onClick={() => setFilterType('READY_DOC')}
              className={`px-2 py-1 rounded ${filterType === 'READY_DOC' ? 'bg-indigo-100 text-indigo-900 font-bold shadow' : 'text-slate-600 hover:text-indigo-800'}`}
            >
              Ready for Dr
            </button>
            <button
              onClick={() => setFilterType('DISCHARGE')}
              className={`px-2 py-1 rounded ${filterType === 'DISCHARGE' ? 'bg-emerald-100 text-emerald-900 font-bold shadow' : 'text-slate-600 hover:text-emerald-800'}`}
            >
              3-Day Afebrile ({dischargeEligibleCount})
            </button>
            <button
              onClick={() => setFilterType('FEVER')}
              className={`px-2 py-1 rounded ${filterType === 'FEVER' ? 'bg-rose-100 text-rose-900 font-bold shadow' : 'text-slate-600 hover:text-rose-800'}`}
            >
              Active Fever
            </button>
            <button
              onClick={() => setFilterType('VACANT')}
              className={`px-2 py-1 rounded ${filterType === 'VACANT' ? 'bg-slate-300 text-slate-900 font-bold shadow' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Vacant
            </button>
          </div>

          {/* Wing Tabs */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveWing('ALL')}
              className={`px-2 py-1 rounded ${activeWing === 'ALL' ? 'bg-white shadow text-blue-700' : 'text-slate-600'}`}
            >
              All Wings
            </button>
            <button
              onClick={() => setActiveWing('A')}
              className={`px-2 py-1 rounded ${activeWing === 'A' ? 'bg-white shadow text-blue-700' : 'text-slate-600'}`}
            >
              Wing A (1-25)
            </button>
            <button
              onClick={() => setActiveWing('B')}
              className={`px-2 py-1 rounded ${activeWing === 'B' ? 'bg-white shadow text-blue-700' : 'text-slate-600'}`}
            >
              Wing B (26-50)
            </button>
            <button
              onClick={() => setActiveWing('C')}
              className={`px-2 py-1 rounded ${activeWing === 'C' ? 'bg-white shadow text-blue-700' : 'text-slate-600'}`}
            >
              Wing C (51-74)
            </button>
          </div>

        </div>
      </div>

      {/* Grid of 74 Rooms */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-3">
        {filteredRooms.map(room => {
          const isVacant = room.status === 'VACANT';
          const latestLog = room.tempLogs[room.tempLogs.length - 1];
          const hasFever = latestLog ? isFever(latestLog.tempC) : false;
          const is3DayFree = room.feverFreeStreak >= 3;

          // Border & Background style based on status
          let cardStyle = 'bg-white border-slate-200 hover:border-blue-400';
          if (isVacant) {
            cardStyle = 'bg-slate-50 border-dashed border-slate-300 hover:border-slate-400 opacity-80';
          } else if (is3DayFree) {
            cardStyle = 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-300/60 hover:shadow-md';
          } else if (hasFever) {
            cardStyle = 'bg-rose-50/40 border-rose-200 hover:border-rose-400';
          } else {
            cardStyle = 'bg-emerald-50/30 border-emerald-200 hover:border-emerald-400';
          }

          return (
            <div
              key={room.roomNumber}
              onClick={() => {
                if (isVacant) {
                  onOpenAdmitModal(room.roomNumber);
                } else {
                  onOpenPatientDetails(room.id);
                }
              }}
              className={`p-2.5 rounded-xl border shadow-sm transition-all cursor-pointer flex flex-col justify-between min-h-[110px] group ${cardStyle}`}
            >
              {/* Header: Room Number and Icons */}
              <div className="flex items-center justify-between">
                <span className={`text-xs font-black px-1.5 py-0.5 rounded ${
                  isVacant 
                    ? 'bg-slate-200 text-slate-600' 
                    : is3DayFree
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-900 text-white'
                }`}>
                  R-{room.roomNumber}
                </span>

                {/* Workflow Status Icons */}
                {!isVacant && (
                  <div className="flex items-center gap-1">
                    {/* Temp indicator */}
                    <span 
                      title={room.isTempTakenToday ? "Morning temperature recorded" : "Pending nurse temperature"}
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                        room.isTempTakenToday 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-amber-100 text-amber-700 font-bold'
                      }`}
                    >
                      <Thermometer className="w-2.5 h-2.5" />
                    </span>

                    {/* Doctor indicator */}
                    <span 
                      title={room.isDoctorVisitedToday ? "Doctor has visited today" : "Pending doctor visit"}
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                        room.isDoctorVisitedToday 
                          ? 'bg-indigo-100 text-indigo-700' 
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <Stethoscope className="w-2.5 h-2.5" />
                    </span>
                  </div>
                )}
              </div>

              {/* Body: Patient Name or Vacant */}
              <div className="my-1.5">
                {isVacant ? (
                  <div className="text-center py-1">
                    <span className="text-[11px] font-bold text-slate-500 block">Vacant Bed</span>
                    <span className="text-[10px] text-blue-600 group-hover:underline flex items-center justify-center gap-0.5 mt-0.5">
                      <PlusCircle className="w-3 h-3" /> Admit
                    </span>
                  </div>
                ) : (
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-800 truncate group-hover:text-blue-600">
                      {room.name}
                    </h5>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[10px] text-slate-400">Day {room.daysInFacility}</span>
                      
                      {/* Temperature reading */}
                      <span className={`text-[10px] font-extrabold px-1 rounded ${
                        hasFever ? 'text-rose-700 bg-rose-100/70' : 'text-emerald-700 bg-emerald-100/70'
                      }`}>
                        {latestLog ? displayTemp(latestLog.tempC) : '--'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer: 3-Day Fever-Free Streak or Status */}
              {!isVacant && (
                <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[9px]">
                  {is3DayFree ? (
                    <span className="text-amber-700 font-extrabold flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                      3/3 Afebrile
                    </span>
                  ) : (
                    <span className="text-slate-400 font-medium">
                      Streak: <strong className="text-slate-700">{room.feverFreeStreak}/3 d</strong>
                    </span>
                  )}
                  
                  <span className={`font-semibold ${
                    room.isTempTakenToday && room.isDoctorVisitedToday 
                      ? 'text-emerald-600' 
                      : room.isTempTakenToday 
                      ? 'text-indigo-600' 
                      : 'text-amber-600'
                  }`}>
                    {room.isTempTakenToday && room.isDoctorVisitedToday 
                      ? 'Done' 
                      : room.isTempTakenToday 
                      ? 'Ready Dr' 
                      : 'Needs Temp'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
