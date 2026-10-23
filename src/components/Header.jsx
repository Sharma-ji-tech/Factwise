import React, { useState } from 'react';
import { useFacility } from '../context/FacilityContext';
import { 
  ShieldAlert, 
  Activity, 
  Calendar, 
  ChevronRight, 
  RotateCcw, 
  Thermometer, 
  Stethoscope, 
  Building2, 
  Users, 
  Bell, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';

export default function Header() {
  const { 
    simDay, 
    advanceDay, 
    resetFacilityData, 
    tempUnit, 
    setTempUnit, 
    activeRole, 
    setActiveRole,
    notifications,
    isMortalityExceeded,
    actualMortalityRate,
    BENCHMARK_MORTALITY_RATE
  } = useFacility();

  const [showNotifs, setShowNotifs] = useState(false);

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-md">
      {/* Top Benchmark Warning Banner if Mortality Exceeds 15% */}
      {isMortalityExceeded && (
        <div className="bg-rose-600 text-white px-4 py-2 text-sm font-semibold flex items-center justify-between shadow-inner animate-pulse">
          <div className="flex items-center gap-2 max-w-6xl mx-auto w-full">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>
              CRITICAL QUALITY ALERT: Current facility mortality rate ({actualMortalityRate}%) has exceeded the expected benchmark ({BENCHMARK_MORTALITY_RATE}%). Clinical audit and emergency response protocol recommended.
            </span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Facility Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
                  AEGIS-74
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Quarantine & Care
                </span>
              </div>
              <p className="text-xs text-slate-400">Viral Treatment Center • 74 Bed Capacity</p>
            </div>
          </div>

          {/* Center: Simulated Day Controller & Workflow Advance */}
          <div className="hidden md:flex items-center gap-3 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>Facility Operational Day: <strong className="text-white text-sm">Day {simDay}</strong></span>
            </div>
            <div className="h-4 w-px bg-slate-700" />
            <button
              onClick={advanceDay}
              title="Simulates the transition into the next morning rounds: resets daily checklists so nurses can record new temperatures and doctors can visit."
              className="flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-3 py-1.5 rounded-md shadow transition-all active:scale-95"
            >
              <span>Advance to Next Day</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: Role Switcher, Unit Toggle, Notifications, Reset */}
          <div className="flex items-center gap-3">
            
            {/* Role Filter Selector */}
            <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setActiveRole('ALL')}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  activeRole === 'ALL' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Roles
              </button>
              <button
                onClick={() => setActiveRole('NURSE')}
                className={`px-2.5 py-1 rounded font-medium flex items-center gap-1 transition-all ${
                  activeRole === 'NURSE' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Thermometer className="w-3.5 h-3.5" />
                <span>Nurse</span>
              </button>
              <button
                onClick={() => setActiveRole('DOCTOR')}
                className={`px-2.5 py-1 rounded font-medium flex items-center gap-1 transition-all ${
                  activeRole === 'DOCTOR' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Doctor</span>
              </button>
              <button
                onClick={() => setActiveRole('ADMIN')}
                className={`px-2.5 py-1 rounded font-medium flex items-center gap-1 transition-all ${
                  activeRole === 'ADMIN' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>

            {/* Temp Unit Toggle */}
            <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs font-semibold">
              <button
                onClick={() => setTempUnit('C')}
                className={`px-2 py-1 rounded ${tempUnit === 'C' ? 'bg-slate-700 text-blue-400' : 'text-slate-400 hover:text-white'}`}
              >
                °C
              </button>
              <button
                onClick={() => setTempUnit('F')}
                className={`px-2 py-1 rounded ${tempUnit === 'F' ? 'bg-slate-700 text-blue-400' : 'text-slate-400 hover:text-white'}`}
              >
                °F
              </button>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-slate-900" />
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Activity & Alerts</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">{notifications.length} events</span>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {notifications.map(n => (
                      <div key={n.id} className="text-xs p-2 rounded-lg bg-slate-800/80 border border-slate-700/50">
                        <p className="text-slate-200 leading-snug">{n.text}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reset Data */}
            <button
              onClick={resetFacilityData}
              title="Reset data back to default sample state"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-slate-700 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
