import React from 'react';
import { useFacility } from '../context/FacilityContext';
import { 
  Bed, 
  Thermometer, 
  Stethoscope, 
  Award, 
  TrendingDown, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function StatSummaryBar() {
  const { 
    TOTAL_ROOMS,
    occupiedCount,
    occupancyPercentage,
    tempsTakenCount,
    tempsPendingCount,
    tempsProgressPct,
    doctorVisitedCount,
    doctorPendingCount,
    doctorProgressPct,
    readyForDoctorCount,
    dischargeEligibleCount,
    actualMortalityRate,
    BENCHMARK_MORTALITY_RATE,
    actualCureRate,
    BENCHMARK_CURE_RATE,
    isMortalityExceeded,
    setActiveTab
  } = useFacility();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      
      {/* 1. Facility Occupancy */}
      <div 
        onClick={() => setActiveTab('rooms')}
        className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Bed Occupancy</span>
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
            <Bed className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-800">{occupiedCount}</span>
          <span className="text-sm font-semibold text-slate-500">/ {TOTAL_ROOMS} Rooms</span>
        </div>
        <div className="mt-2.5">
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${occupancyPercentage}%` }} 
            />
          </div>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">
            {occupancyPercentage}% capacity ({TOTAL_ROOMS - occupiedCount} vacant)
          </span>
        </div>
      </div>

      {/* 2. Temperature Rounds */}
      <div 
        onClick={() => setActiveTab('rounds')}
        className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Morning Temps</span>
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
            <Thermometer className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-emerald-600">{tempsTakenCount}</span>
          <span className="text-sm font-semibold text-slate-500">/ {occupiedCount} Taken</span>
        </div>
        <div className="mt-2.5">
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${tempsProgressPct}%` }} 
            />
          </div>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">
            {tempsPendingCount === 0 ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> All temperatures recorded
              </span>
            ) : (
              <span className="text-amber-600 font-semibold">{tempsPendingCount} patients still waiting</span>
            )}
          </span>
        </div>
      </div>

      {/* 3. Doctor Daily Visits */}
      <div 
        onClick={() => setActiveTab('rounds')}
        className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Doctor Visits</span>
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
            <Stethoscope className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-indigo-600">{doctorVisitedCount}</span>
          <span className="text-sm font-semibold text-slate-500">/ {occupiedCount} Visited</span>
        </div>
        <div className="mt-2.5">
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${doctorProgressPct}%` }} 
            />
          </div>
          <span className="text-[11px] font-medium text-slate-500 mt-1 block">
            <span className="text-indigo-600 font-bold">{readyForDoctorCount}</span> ready for doctor right now
          </span>
        </div>
      </div>

      {/* 4. Discharge Readiness (3-Day Fever Free) */}
      <div 
        onClick={() => setActiveTab('discharge')}
        className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
      >
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Discharge Queue</span>
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-amber-600">{dischargeEligibleCount}</span>
          <span className="text-xs font-semibold text-slate-500">Candidates</span>
        </div>
        <div className="mt-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
            <span>3 full days fever-free</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Frees up rooms for intake</span>
        </div>
      </div>

      {/* 5. Mortality vs 15% Benchmark */}
      <div 
        onClick={() => setActiveTab('analytics')}
        className={`p-4 rounded-xl border shadow-sm transition-all cursor-pointer group ${
          isMortalityExceeded 
            ? 'bg-rose-50/70 border-rose-300 hover:border-rose-500' 
            : 'bg-white border-slate-200/80 hover:border-emerald-400 hover:shadow-md'
        }`}
      >
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Mortality Rate</span>
          <div className={`p-2 rounded-lg ${isMortalityExceeded ? 'bg-rose-100 text-rose-700' : 'bg-emerald-50 text-emerald-600'}`}>
            {isMortalityExceeded ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-black ${isMortalityExceeded ? 'text-rose-600' : 'text-slate-800'}`}>
            {actualMortalityRate}%
          </span>
          <span className="text-xs font-medium text-slate-500">Target: ≤{BENCHMARK_MORTALITY_RATE}%</span>
        </div>
        <div className="mt-2.5">
          <div className="flex items-center gap-1 text-[11px] font-semibold">
            {isMortalityExceeded ? (
              <span className="text-rose-700 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                Above 15% benchmark
              </span>
            ) : (
              <span className="text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Below expected 15%
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Cure Rate: <strong>{actualCureRate}%</strong> (Bench: {BENCHMARK_CURE_RATE}%)
          </span>
        </div>
      </div>

    </div>
  );
}
