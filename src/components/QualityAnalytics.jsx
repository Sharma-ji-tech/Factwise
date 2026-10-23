import React, { useState } from 'react';
import { useFacility } from '../context/FacilityContext';
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  ShieldCheck, 
  Award, 
  Users, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Calendar,
  Clock,
  HeartPulse,
  Filter
} from 'lucide-react';
import { isFever } from '../data/mockData';

export default function QualityAnalytics() {
  const { 
    history, 
    activePatients, 
    actualMortalityRate, 
    actualCureRate, 
    BENCHMARK_MORTALITY_RATE, 
    BENCHMARK_CURE_RATE, 
    isMortalityExceeded,
    occupiedCount,
    TOTAL_ROOMS
  } = useFacility();

  const [outcomeFilter, setOutcomeFilter] = useState('ALL'); // ALL, CURED, DECEASED

  const totalFinished = history.totalDischarges;
  const curedCount = history.dischargedCured;
  const deceasedCount = history.deceased;

  // Temperature distribution among current inpatients
  const highFeverCount = activePatients.filter(p => {
    const l = p.tempLogs[p.tempLogs.length - 1];
    return l && l.tempC >= 38.5;
  }).length;

  const mildFeverCount = activePatients.filter(p => {
    const l = p.tempLogs[p.tempLogs.length - 1];
    return l && l.tempC >= 38.0 && l.tempC < 38.5;
  }).length;

  const afebrileCount = activePatients.filter(p => {
    const l = p.tempLogs[p.tempLogs.length - 1];
    return l && l.tempC < 38.0;
  }).length;

  const filteredHistory = history.historicalLog.filter(item => {
    if (outcomeFilter === 'ALL') return true;
    return item.outcome === outcomeFilter;
  });

  const mortalityDelta = (BENCHMARK_MORTALITY_RATE - parseFloat(actualMortalityRate)).toFixed(1);

  return (
    <div className="space-y-6">

      {/* Benchmark Quality Alert / Status Banner */}
      <div className={`p-6 rounded-2xl border shadow-sm ${
        isMortalityExceeded 
          ? 'bg-rose-50 border-rose-300 text-rose-900' 
          : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`p-3 rounded-xl ${isMortalityExceeded ? 'bg-rose-600 text-white animate-bounce' : 'bg-emerald-600 text-white'}`}>
              {isMortalityExceeded ? <AlertTriangle className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">
                  {isMortalityExceeded 
                    ? '⚠️ CRITICAL QUALITY ALERT: Benchmark Threshold Exceeded' 
                    : '✅ QUALITY ASSURANCE: Facility Operating Within Safety Benchmarks'}
                </h3>
              </div>
              <p className="text-xs mt-1 leading-relaxed max-w-2xl text-slate-600">
                {isMortalityExceeded 
                  ? `Center mortality rate (${actualMortalityRate}%) is currently higher than the accepted 15.0% virus benchmark. Prompt clinical intervention, staffing redeployment, and treatment regimen review are urgently advised.`
                  : `Center mortality rate (${actualMortalityRate}%) is safely below the expected 15.0% threshold (${mortalityDelta}% margin). Clinical success rate is currently ${actualCureRate}% vs ${BENCHMARK_CURE_RATE}% benchmark.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="px-4 py-2 rounded-xl bg-white/80 border border-slate-200/80 text-center shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Baseline Virus Target</span>
              <span className="text-base font-black text-slate-800">15.0% Mortality</span>
            </div>
            <div className={`px-4 py-2 rounded-xl text-center shadow-xs ${
              isMortalityExceeded ? 'bg-rose-600 text-white font-black' : 'bg-emerald-600 text-white font-black'
            }`}>
              <span className="text-[10px] uppercase font-bold text-white/80 block">Current Performance</span>
              <span className="text-base">{actualMortalityRate}% Actual</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Benchmark Comparative Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Mortality Rate vs 15% */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Mortality Rate</span>
            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
              isMortalityExceeded ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {isMortalityExceeded ? 'Above Target' : 'Target Met'}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-black ${isMortalityExceeded ? 'text-rose-600' : 'text-slate-900'}`}>
              {actualMortalityRate}%
            </span>
            <span className="text-xs text-slate-400 font-semibold">/ 15.0% Target</span>
          </div>

          <div className="space-y-1">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
              <div 
                className={`h-2 transition-all duration-500 ${isMortalityExceeded ? 'bg-rose-600' : 'bg-emerald-500'}`} 
                style={{ width: `${Math.min(parseFloat(actualMortalityRate) * 3, 100)}%` }} 
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0%</span>
              <span className="text-slate-600 font-bold">15% Max Benchmark</span>
              <span>30%+</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Cure / Success Rate vs 85% */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Cure Success Rate</span>
            <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Target: ≥85%
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">
              {actualCureRate}%
            </span>
            <span className="text-xs text-slate-400 font-semibold">/ 85.0% Target</span>
          </div>

          <div className="space-y-1">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(parseFloat(actualCureRate), 100)}%` }} 
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0%</span>
              <span className="text-slate-600 font-bold">85% Benchmark</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Total Completed Patient Outcomes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Resolved Outcomes</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalFinished}</span>
            <span className="text-xs text-slate-400 font-semibold">Patients</span>
          </div>

          <div className="text-xs flex items-center justify-between text-slate-600 pt-1">
            <span className="flex items-center gap-1 font-semibold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" /> {curedCount} Cured
            </span>
            <span className="flex items-center gap-1 font-semibold text-rose-700">
              <AlertTriangle className="w-3.5 h-3.5" /> {deceasedCount} Deceased
            </span>
          </div>
        </div>

        {/* Metric 4: Average Length of Stay */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Average Stay to Cure</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-600">7.6</span>
            <span className="text-xs text-slate-400 font-semibold">Days / Patient</span>
          </div>

          <p className="text-[11px] text-slate-500">
            Patients spend avg 4.6 days in fever + 3 full days in afebrile recovery.
          </p>
        </div>

      </div>

      {/* Visual Clinical Breakdown: Current Inpatients Temperature Profile */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Current Inpatient Fever & Severity Distribution</h3>
            <p className="text-xs text-slate-500">Categorization across all currently active quarantine beds ({occupiedCount} patients)</p>
          </div>
          <HeartPulse className="w-5 h-5 text-rose-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900">Afebrile (Normal)</span>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                &lt; 38.0°C
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-700">{afebrileCount}</span>
              <span className="text-xs text-emerald-600">patients ({Math.round((afebrileCount / occupiedCount) * 100)}%)</span>
            </div>
            <p className="text-[11px] text-emerald-700 mt-1">In 3-day recovery streak or cured candidate.</p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900">Mild / Moderate Fever</span>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-800">
                38.0°C - 38.4°C
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-700">{mildFeverCount}</span>
              <span className="text-xs text-amber-600">patients ({Math.round((mildFeverCount / occupiedCount) * 100)}%)</span>
            </div>
            <p className="text-[11px] text-amber-700 mt-1">Receiving antipyretics and oral hydration.</p>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-900">High / Severe Fever</span>
              <span className="text-xs font-black px-2 py-0.5 rounded-full bg-rose-200 text-rose-800">
                ≥ 38.5°C
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-700">{highFeverCount}</span>
              <span className="text-xs text-rose-600">patients ({Math.round((highFeverCount / occupiedCount) * 100)}%)</span>
            </div>
            <p className="text-[11px] text-rose-700 mt-1">Active antiviral therapy & physician priority.</p>
          </div>

        </div>
      </div>

      {/* Historical Outcomes Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Facility Historical Clinical Performance Log</h3>
            <p className="text-xs text-slate-500">Registry of all discharged and deceased outcomes for benchmark audit</p>
          </div>

          <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setOutcomeFilter('ALL')}
              className={`px-3 py-1 rounded ${outcomeFilter === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All Outcomes ({history.historicalLog.length})
            </button>
            <button
              onClick={() => setOutcomeFilter('CURED')}
              className={`px-3 py-1 rounded ${outcomeFilter === 'CURED' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Cured Only
            </button>
            <button
              onClick={() => setOutcomeFilter('DECEASED')}
              className={`px-3 py-1 rounded ${outcomeFilter === 'DECEASED' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Deceased Only
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Room</th>
                <th className="py-3 px-4">Age</th>
                <th className="py-3 px-4">Days Stayed</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Clinical Case Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.map(row => (
                <tr key={row.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-bold text-slate-800">{row.name}</td>
                  <td className="py-3 px-4 text-slate-600">Room {row.room}</td>
                  <td className="py-3 px-4 text-slate-600">{row.age}y</td>
                  <td className="py-3 px-4 font-semibold text-slate-700">{row.daysStayed} days</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded font-black text-[10px] ${
                      row.outcome === 'CURED' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {row.outcome}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{row.date}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{row.cause}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
