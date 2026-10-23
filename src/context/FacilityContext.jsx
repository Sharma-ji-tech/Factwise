import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  generateInitialPatients, 
  generateInitialHistory, 
  FEVER_THRESHOLD_C, 
  BENCHMARK_MORTALITY_RATE, 
  BENCHMARK_CURE_RATE,
  TOTAL_ROOMS,
  calculateFeverFreeDays,
  isFever,
  cToF,
  fToC
} from '../data/mockData';

const FacilityContext = createContext();

const STORAGE_KEY_PATIENTS = 'qtrack_patients_v1';
const STORAGE_KEY_HISTORY = 'qtrack_history_v1';
const STORAGE_KEY_SIM_DAY = 'qtrack_sim_day_v1';

export function FacilityProvider({ children }) {
  const [patients, setPatients] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PATIENTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return generateInitialPatients();
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return generateInitialHistory();
  });

  const [simDay, setSimDay] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SIM_DAY);
    return saved ? parseInt(saved, 10) : 14;
  });

  const [tempUnit, setTempUnit] = useState('C'); // 'C' or 'F'
  const [activeRole, setActiveRole] = useState('ALL'); // 'ALL', 'NURSE', 'DOCTOR', 'ADMIN'
  const [activeTab, setActiveTab] = useState('rounds'); // 'rounds', 'rooms', 'discharge', 'analytics'
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'success', text: '6 patients have reached 3 days fever-free and are awaiting discharge sign-off.', time: 'Just now' },
    { id: 2, type: 'warning', text: 'Morning temperature rounds: 32 patients still pending nurse temperature measurement.', time: '10m ago' }
  ]);

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PATIENTS, JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SIM_DAY, simDay.toString());
  }, [simDay]);

  const addNotification = (text, type = 'info') => {
    const newNotif = {
      id: Date.now(),
      type,
      text,
      time: 'Just now'
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 7)]);
  };

  // 1. Record Nurse Temperature
  const recordTemperature = (patientId, { tempC, recordedBy = 'Nurse Sarah', notes = '', symptoms = [] }) => {
    const numericTemp = parseFloat(tempC);
    if (isNaN(numericTemp) || numericTemp < 34 || numericTemp > 43) {
      alert('Please enter a valid temperature between 34.0°C and 43.0°C (93.2°F - 109.4°F)');
      return false;
    }

    setPatients(prev => prev.map(patient => {
      if (patient.id !== patientId) return patient;

      const dateStr = `Day ${simDay}`;
      const newLog = {
        dayIndex: simDay,
        date: dateStr,
        tempC: numericTemp,
        recordedBy,
        notes: notes || (numericTemp >= FEVER_THRESHOLD_C ? 'Fever present' : 'Afebrile (Normal)'),
        symptoms: symptoms.length > 0 ? symptoms : patient.symptoms,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // If already recorded today, replace today's log or append
      let updatedLogs = [...patient.tempLogs];
      const todayIndex = updatedLogs.findIndex(l => l.dayIndex === simDay);
      if (todayIndex >= 0) {
        updatedLogs[todayIndex] = newLog;
      } else {
        updatedLogs.push(newLog);
      }

      const feverStreak = calculateFeverFreeDays(updatedLogs);
      let dischargeStatus = patient.dischargeStatus;
      
      // Automatic 3-day fever-free trigger!
      if (feverStreak >= 3 && dischargeStatus === 'NOT_READY') {
        dischargeStatus = 'ELIGIBLE_PENDING_DOCTOR';
        addNotification(`🎉 Room ${patient.roomNumber} (${patient.name}) has achieved 3 consecutive days fever-free! Flagged for discharge review.`, 'success');
      } else if (feverStreak < 3 && dischargeStatus !== 'NOT_READY') {
        // Fever recurred!
        dischargeStatus = 'NOT_READY';
        addNotification(`⚠️ Room ${patient.roomNumber} (${patient.name}) registered a fever (${numericTemp}°C). Discharge qualification reset.`, 'warning');
      }

      let workflowStatus = 'READY_FOR_DOCTOR';
      if (dischargeStatus === 'ELIGIBLE_PENDING_DOCTOR' || dischargeStatus === 'DOCTOR_APPROVED') {
        workflowStatus = 'DISCHARGE_READY';
      } else if (patient.isDoctorVisitedToday) {
        workflowStatus = 'COMPLETED_TODAY';
      }

      return {
        ...patient,
        tempLogs: updatedLogs,
        isTempTakenToday: true,
        feverFreeStreak: feverStreak,
        dischargeStatus,
        workflowStatus,
        lastTempTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }));

    addNotification(`Temperature ${numericTemp}°C logged for Room ${patients.find(p => p.id === patientId)?.roomNumber}`, 'info');
    return true;
  };

  // 2. Record Doctor Visit
  const recordDoctorVisit = (patientId, { doctorName = 'Dr. Chen', notes = '', medications = [], approveDischarge = false }) => {
    setPatients(prev => prev.map(patient => {
      if (patient.id !== patientId) return patient;

      let dischargeStatus = patient.dischargeStatus;
      if (approveDischarge || (patient.feverFreeStreak >= 3 && dischargeStatus === 'ELIGIBLE_PENDING_DOCTOR')) {
        dischargeStatus = 'DOCTOR_APPROVED';
        addNotification(`📋 Dr. approved discharge for Room ${patient.roomNumber} (${patient.name}). Notified Admin Staff for bed release.`, 'success');
      }

      let workflowStatus = 'COMPLETED_TODAY';
      if (dischargeStatus === 'DOCTOR_APPROVED' || dischargeStatus === 'ELIGIBLE_PENDING_DOCTOR') {
        workflowStatus = 'DISCHARGE_READY';
      }

      return {
        ...patient,
        isDoctorVisitedToday: true,
        doctorNotes: notes || 'Patient assessed. Continuing protocol.',
        doctorName,
        currentMedications: medications.length > 0 ? medications : patient.currentMedications,
        lastVisitedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dischargeStatus,
        workflowStatus
      };
    }));

    return true;
  };

  // 3. Approve Discharge (Doctor action)
  const doctorApproveDischarge = (patientId, doctorName = 'Dr. Chen') => {
    setPatients(prev => prev.map(patient => {
      if (patient.id !== patientId) return patient;
      addNotification(`Doctor approved discharge for Room ${patient.roomNumber} (${patient.name}). Transferred to Admin bed release queue.`, 'success');
      return {
        ...patient,
        dischargeStatus: 'DOCTOR_APPROVED',
        workflowStatus: 'DISCHARGE_READY',
        doctorNotes: `${patient.doctorNotes || ''} [Discharge Approved by ${doctorName}]`
      };
    }));
  };

  // 4. Process Discharge / Bed Release (Admin action)
  const processDischarge = (patientId, outcome = 'CURED', summaryNotes = '') => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const isCured = outcome === 'CURED';
    const isDeceased = outcome === 'DECEASED';

    // Update history
    setHistory(prev => {
      const newDischargedCured = isCured ? prev.dischargedCured + 1 : prev.dischargedCured;
      const newDeceased = isDeceased ? prev.deceased + 1 : prev.deceased;
      const newTotal = newDischargedCured + newDeceased;

      const newHistoryItem = {
        id: `H-${Date.now()}`,
        name: patient.name,
        room: patient.roomNumber,
        age: patient.age,
        outcome: outcome,
        date: new Date().toISOString().split('T')[0],
        cause: summaryNotes || (isCured ? '3 full days afebrile (cured)' : 'Complications from viral infection'),
        daysStayed: patient.daysInFacility
      };

      return {
        dischargedCured: newDischargedCured,
        deceased: newDeceased,
        totalDischarges: newTotal,
        historicalLog: [newHistoryItem, ...prev.historicalLog]
      };
    });

    // Make room vacant
    setPatients(prev => prev.map(p => {
      if (p.id !== patientId) return p;
      return {
        ...p,
        name: `[Vacant Room ${p.roomNumber}]`,
        status: 'VACANT',
        workflowStatus: 'VACANT',
        dischargeStatus: 'NOT_READY',
        feverFreeStreak: 0,
        isTempTakenToday: false,
        isDoctorVisitedToday: false,
        tempLogs: [],
        daysInFacility: 0,
        symptoms: [],
        currentMedications: [],
        doctorNotes: '',
        vacatedDate: new Date().toISOString().split('T')[0],
        previousPatient: {
          name: patient.name,
          outcome,
          date: new Date().toISOString().split('T')[0]
        }
      };
    }));

    if (isCured) {
      addNotification(`🎉 Room ${patient.roomNumber} processed for discharge! Patient cured and bed released for next incoming patient.`, 'success');
    } else if (isDeceased) {
      addNotification(`🕊️ Room ${patient.roomNumber} recorded deceased outcome. Mortality stats updated. Bed released.`, 'danger');
    }
  };

  // 5. Admit Patient to Vacant Room
  const admitPatient = (roomNumber, { name, age, gender, initialTempC, symptoms = [], notes = '' }) => {
    const numericRoom = parseInt(roomNumber, 10);
    const existing = patients.find(p => p.roomNumber === numericRoom);
    if (!existing || existing.status !== 'VACANT') {
      alert(`Room ${roomNumber} is not currently vacant.`);
      return false;
    }

    const temp = parseFloat(initialTempC) || 38.6;
    const initialLog = {
      dayIndex: simDay,
      date: `Day ${simDay}`,
      tempC: temp,
      recordedBy: 'Triage Nurse',
      notes: notes || 'Initial intake assessment',
      symptoms: symptoms.length > 0 ? symptoms : ['Fever', 'Fatigue'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setPatients(prev => prev.map(p => {
      if (p.roomNumber !== numericRoom) return p;
      return {
        ...p,
        id: `P-${Date.now()}`,
        name,
        age: parseInt(age, 10) || 35,
        gender: gender || 'Other',
        status: 'ACTIVE',
        admissionDate: new Date().toISOString().split('T')[0],
        daysInFacility: 1,
        tempLogs: [initialLog],
        isTempTakenToday: true,
        isDoctorVisitedToday: false,
        feverFreeStreak: temp < FEVER_THRESHOLD_C ? 1 : 0,
        dischargeStatus: 'NOT_READY',
        workflowStatus: 'READY_FOR_DOCTOR',
        symptoms: symptoms.length > 0 ? symptoms : ['Fever', 'Fatigue'],
        currentMedications: ['Hydration IV', 'Antipyretic (Paracetamol)'],
        doctorNotes: '',
        lastTempTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }));

    addNotification(`Patient ${name} successfully admitted into Room ${roomNumber}.`, 'success');
    return true;
  };

  // 6. Simulate Next Day
  const advanceDay = () => {
    const nextDay = simDay + 1;
    setSimDay(nextDay);

    setPatients(prev => prev.map(p => {
      if (p.status === 'VACANT') return p;

      // New day begins: reset today's checkmark so nurse and doctor must visit again
      const feverFreeStreak = calculateFeverFreeDays(p.tempLogs);
      let dischargeStatus = p.dischargeStatus;
      let workflowStatus = 'NEEDS_TEMP';

      if (dischargeStatus === 'DOCTOR_APPROVED' || dischargeStatus === 'ELIGIBLE_PENDING_DOCTOR') {
        workflowStatus = 'DISCHARGE_READY';
      }

      return {
        ...p,
        daysInFacility: p.daysInFacility + 1,
        isTempTakenToday: false,
        isDoctorVisitedToday: false,
        workflowStatus,
        lastTempTime: null,
        lastVisitedTime: null
      };
    }));

    addNotification(`🌅 Advanced to Day ${nextDay}! Morning temperature rounds have started for all rooms.`, 'info');
  };

  // 7. Reset sample data
  const resetFacilityData = () => {
    if (window.confirm('Reset all 74 rooms and facility metrics back to initial benchmark dataset?')) {
      localStorage.removeItem(STORAGE_KEY_PATIENTS);
      localStorage.removeItem(STORAGE_KEY_HISTORY);
      localStorage.removeItem(STORAGE_KEY_SIM_DAY);
      setPatients(generateInitialPatients());
      setHistory(generateInitialHistory());
      setSimDay(14);
      addNotification('Facility data reset to standard default dataset.', 'info');
    }
  };

  // Calculations
  const activePatients = patients.filter(p => p.status === 'ACTIVE');
  const vacantRooms = patients.filter(p => p.status === 'VACANT');
  const occupiedCount = activePatients.length;
  const occupancyPercentage = ((occupiedCount / TOTAL_ROOMS) * 100).toFixed(0);

  // Daily Workflow Metrics
  const tempsTakenCount = activePatients.filter(p => p.isTempTakenToday).length;
  const tempsPendingCount = activePatients.length - tempsTakenCount;
  const tempsProgressPct = activePatients.length > 0 ? Math.round((tempsTakenCount / activePatients.length) * 100) : 0;

  const doctorVisitedCount = activePatients.filter(p => p.isDoctorVisitedToday).length;
  const doctorPendingCount = activePatients.length - doctorVisitedCount;
  const doctorProgressPct = activePatients.length > 0 ? Math.round((doctorVisitedCount / activePatients.length) * 100) : 0;

  const readyForDoctorCount = activePatients.filter(p => p.isTempTakenToday && !p.isDoctorVisitedToday).length;
  const dischargeEligibleCount = activePatients.filter(p => p.feverFreeStreak >= 3).length;
  const doctorApprovedCount = activePatients.filter(p => p.dischargeStatus === 'DOCTOR_APPROVED').length;

  // Mortality & Benchmark Calculations
  const totalCompletedOutcomes = history.totalDischarges;
  const actualMortalityRate = totalCompletedOutcomes > 0 
    ? ((history.deceased / totalCompletedOutcomes) * 100).toFixed(1) 
    : 0;
  const actualCureRate = totalCompletedOutcomes > 0 
    ? ((history.dischargedCured / totalCompletedOutcomes) * 100).toFixed(1) 
    : 0;
  
  const isMortalityExceeded = parseFloat(actualMortalityRate) > BENCHMARK_MORTALITY_RATE;

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || null;

  return (
    <FacilityContext.Provider value={{
      patients,
      activePatients,
      vacantRooms,
      history,
      simDay,
      tempUnit,
      setTempUnit,
      activeRole,
      setActiveRole,
      activeTab,
      setActiveTab,
      selectedPatient,
      selectedPatientId,
      setSelectedPatientId,
      notifications,
      recordTemperature,
      recordDoctorVisit,
      doctorApproveDischarge,
      processDischarge,
      admitPatient,
      advanceDay,
      resetFacilityData,
      // Aggregates
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
      doctorApprovedCount,
      actualMortalityRate,
      actualCureRate,
      isMortalityExceeded,
      BENCHMARK_MORTALITY_RATE,
      BENCHMARK_CURE_RATE
    }}>
      {children}
    </FacilityContext.Provider>
  );
}

export function useFacility() {
  const context = useContext(FacilityContext);
  if (!context) {
    throw new Error('useFacility must be used within a FacilityProvider');
  }
  return context;
}
