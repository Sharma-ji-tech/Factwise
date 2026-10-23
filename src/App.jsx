import React, { useState } from 'react';
import { FacilityProvider, useFacility } from './context/FacilityContext';
import Header from './components/Header';
import StatSummaryBar from './components/StatSummaryBar';
import DailyWorkflowBoard from './components/DailyWorkflowBoard';
import FacilityGrid from './components/FacilityGrid';
import DischargeQueue from './components/DischargeQueue';
import QualityAnalytics from './components/QualityAnalytics';
import RecordTempModal from './components/RecordTempModal';
import DoctorVisitModal from './components/DoctorVisitModal';
import PatientDetailModal from './components/PatientDetailModal';
import AdmitPatientModal from './components/AdmitPatientModal';
import { 
  ClipboardList, 
  Bed, 
  Award, 
  Activity, 
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

function MainApp() {
  const { 
    activeTab, 
    setActiveTab, 
    activeRole, 
    selectedPatientId, 
    setSelectedPatientId,
    dischargeEligibleCount,
    readyForDoctorCount,
    tempsPendingCount,
    vacantRooms
  } = useFacility();

  // Modal states
  const [tempModalPatient, setTempModalPatient] = useState(null);
  const [doctorModalPatient, setDoctorModalPatient] = useState(null);
  const [admitModalRoom, setAdmitModalRoom] = useState(null);
  const [showDemoGuide, setShowDemoGuide] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100/80 flex flex-col font-sans">
      
      {/* Top Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        
        {/* Vital Facility KPI Banner */}
        <StatSummaryBar />

        {/* Navigation Tabs Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 gap-3 pb-1">
          <nav className="flex space-x-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab('rounds')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'rounds'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/80'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Daily Rounds Workflow</span>
              {readyForDoctorCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === 'rounds' ? 'bg-blue-800 text-blue-100' : 'bg-indigo-100 text-indigo-700 font-bold'
                }`}>
                  {readyForDoctorCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('rooms')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'rooms'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/80'
              }`}
            >
              <Bed className="w-4 h-4" />
              <span>74-Room Facility Map</span>
            </button>

            <button
              onClick={() => setActiveTab('discharge')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'discharge'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/80'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Discharge Administration</span>
              {dischargeEligibleCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'discharge' ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-800'
                }`}>
                  {dischargeEligibleCount} Ready
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/80'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Quality & 15% Benchmark</span>
            </button>
          </nav>

          {/* Guide / How to Demo Button */}
          <button
            onClick={() => setShowDemoGuide(!showDemoGuide)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs transition self-start sm:self-auto"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
            <span>Prototype Guide & Problem Solved</span>
          </button>
        </div>

        {/* Prototype Walkthrough & Problem-Solution Guide Drawer */}
        {showDemoGuide && (
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl border border-slate-800 space-y-3 animate-fade-in text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-sm text-amber-300">Head Doctor's Problem Statement & How This App Solves It</h4>
              </div>
              <button onClick={() => setShowDemoGuide(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="font-bold text-blue-300 block mb-1">1. Nurse Temperature Coordination</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  <strong>Pain Point:</strong> Unclear which patients had their temperatures taken; duplicate checks or missed checks.<br/>
                  <strong>Solution:</strong> The "Pending Temp" queue displays all rooms needing morning measurements. Logging a temperature moves the patient to "Ready for Doctor" and prevents duplicate checks.
                </p>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="font-bold text-indigo-300 block mb-1">2. Doctor Visit Timing</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  <strong>Pain Point:</strong> Doctors visiting before temperature is recorded, wasting time measuring it themselves or coming back.<br/>
                  <strong>Solution:</strong> The "Ready for Doctor" queue only contains patients whose morning temperatures are already recorded. If a doctor opens a patient without a temperature, an alert prompts them.
                </p>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="font-bold text-emerald-300 block mb-1">3. 3-Day Rule & 15% Benchmark</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  <strong>Pain Point:</strong> Patients staying extra days because doctors fail to inform admin about discharges; no tracking of the 15% mortality benchmark.<br/>
                  <strong>Solution:</strong> Automated 3-day fever-free detector notifies doctors & admin instantly. Quality dashboard tracks center mortality vs the 15% threshold with audit alerts.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Daily Workflow Board */}
        {activeTab === 'rounds' && (
          <DailyWorkflowBoard
            onOpenTempModal={(patient) => setTempModalPatient(patient)}
            onOpenDoctorModal={(patient) => setDoctorModalPatient(patient)}
            onOpenPatientDetails={(id) => setSelectedPatientId(id)}
          />
        )}

        {/* Tab 2: 74-Room Grid */}
        {activeTab === 'rooms' && (
          <FacilityGrid
            onOpenPatientDetails={(id) => setSelectedPatientId(id)}
            onOpenAdmitModal={(roomNum) => setAdmitModalRoom(roomNum)}
            onOpenTempModal={(patient) => setTempModalPatient(patient)}
          />
        )}

        {/* Tab 3: Discharge Queue */}
        {activeTab === 'discharge' && (
          <DischargeQueue
            onOpenPatientDetails={(id) => setSelectedPatientId(id)}
            onOpenAdmitModal={(roomNum) => setAdmitModalRoom(roomNum)}
          />
        )}

        {/* Tab 4: Quality & Mortality Benchmark Analytics */}
        {activeTab === 'analytics' && (
          <QualityAnalytics />
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AEGIS-74 Viral Quarantine & Patient Tracking Prototype • Version 1.0</span>
          <span className="text-[11px] text-slate-400">Standard: 3 Full Days Afebrile (&lt;38.0°C) for Discharge • 15.0% Benchmark Mortality</span>
        </div>
      </footer>

      {/* Interactive Modals */}
      {tempModalPatient && (
        <RecordTempModal
          patient={tempModalPatient}
          onClose={() => setTempModalPatient(null)}
        />
      )}

      {doctorModalPatient && (
        <DoctorVisitModal
          patient={doctorModalPatient}
          onClose={() => setDoctorModalPatient(null)}
          onSwitchToTempModal={(p) => setTempModalPatient(p)}
        />
      )}

      {selectedPatientId && (
        <PatientDetailModal
          patientId={selectedPatientId}
          onClose={() => setSelectedPatientId(null)}
          onOpenTempModal={(p) => setTempModalPatient(p)}
          onOpenDoctorModal={(p) => setDoctorModalPatient(p)}
        />
      )}

      {admitModalRoom && (
        <AdmitPatientModal
          initialRoomNumber={admitModalRoom}
          onClose={() => setAdmitModalRoom(null)}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <FacilityProvider>
      <MainApp />
    </FacilityProvider>
  );
}
