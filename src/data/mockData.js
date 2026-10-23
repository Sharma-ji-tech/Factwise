// Mock data generator for 74-room quarantine facility

export const FEVER_THRESHOLD_C = 38.0; // 38.0°C is standard medical fever cutoff
export const BENCHMARK_MORTALITY_RATE = 15.0; // 15% expected mortality
export const BENCHMARK_CURE_RATE = 85.0; // 85% expected cure rate
export const TOTAL_ROOMS = 74;

// Conversion helpers
export const cToF = (c) => ((c * 9) / 5 + 32).toFixed(1);
export const fToC = (f) => (((f - 32) * 5) / 9).toFixed(1);

// Helper to determine if a temperature is fever
export const isFever = (tempC) => parseFloat(tempC) >= FEVER_THRESHOLD_C;

// Helper to calculate consecutive fever-free days from historical logs
export function calculateFeverFreeDays(tempLogs) {
  if (!tempLogs || tempLogs.length === 0) return 0;
  
  // Group logs by day (or take the highest temp of each day)
  // tempLogs is sorted newest first or oldest first. Let's assume daily readings list
  // Count consecutive days ending with the latest day where daily max temp < 38.0°C
  let streak = 0;
  for (let i = tempLogs.length - 1; i >= 0; i--) {
    const log = tempLogs[i];
    if (log.tempC < FEVER_THRESHOLD_C) {
      streak++;
    } else {
      break; // fever broke the streak
    }
  }
  return streak;
}

const FIRST_NAMES = [
  "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", 
  "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", 
  "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa", 
  "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley", 
  "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle", 
  "Kenneth", "Carol", "Kevin", "Amanda", "Brian", "Dorothy", "George", "Melissa", 
  "Edward", "Deborah", "Ronald", "Stephanie", "Timothy", "Rebecca", "Jason", "Sharon", 
  "Jeffrey", "Laura", "Ryan", "Cynthia", "Jacob", "Kathleen", "Gary", "Amy", 
  "Nicholas", "Shirley", "Eric", "Angela", "Jonathan", "Helen", "Stephen", "Anna", 
  "Larry", "Brenda"
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
  "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
  "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
  "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker",
  "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy",
  "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson", "Bailey",
  "Reed", "Kelly"
];

// Generate 74 realistic patients in 74 rooms
export function generateInitialPatients() {
  const patients = [];
  const currentDate = new Date();
  
  for (let room = 1; room <= TOTAL_ROOMS; room++) {
    const firstName = FIRST_NAMES[(room - 1) % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(room * 3) % LAST_NAMES.length];
    const age = 22 + ((room * 7) % 58);
    const gender = room % 2 === 0 ? "Female" : "Male";
    
    // Assign patient stage/scenario to ensure realistic diversity
    // - Rooms 1-6: Discharged candidates (3+ days fever-free!)
    // - Rooms 7-14: Almost ready (2 days fever-free)
    // - Rooms 15-24: Improving (1 day fever-free)
    // - Rooms 25-50: Active symptomatic fever (38.2 - 39.6)
    // - Rooms 51-64: Fresh admissions (Days 1-2, high fever)
    // - Rooms 65-74: Severe / ICU observation
    
    let daysInFacility = 3 + (room % 8);
    let logs = [];
    let isTempTakenToday = false;
    let isDoctorVisitedToday = false;
    let dischargeStatus = "NOT_READY"; // NOT_READY, ELIGIBLE_PENDING_DOCTOR, DOCTOR_APPROVED
    
    if (room <= 6) {
      // 3 full days fever-free! Ready for discharge!
      daysInFacility = 7 + (room % 4);
      // History: High fever early on, then 3-4 consecutive normal days
      logs = [
        { dayIndex: 1, date: "Day -5", tempC: 39.1, recordedBy: "Nurse Sarah", notes: "Admitted with chills, high fever" },
        { dayIndex: 2, date: "Day -4", tempC: 38.8, recordedBy: "Nurse Alex", notes: "Antipyretic therapy started" },
        { dayIndex: 3, date: "Day -3", tempC: 37.3, recordedBy: "Nurse Sarah", notes: "Fever broken" },
        { dayIndex: 4, date: "Day -2", tempC: 37.1, recordedBy: "Nurse Alex", notes: "Stable, mild cough" },
        { dayIndex: 5, date: "Day -1", tempC: 36.9, recordedBy: "Nurse Maria", notes: "Afebrile, eating well" },
        { dayIndex: 6, date: "Today", tempC: 36.8, recordedBy: "Nurse Alex", notes: "Day 3/3 afebrile! Ready for discharge" }
      ];
      isTempTakenToday = true;
      isDoctorVisitedToday = room % 2 === 0;
      dischargeStatus = room % 2 === 0 ? "DOCTOR_APPROVED" : "ELIGIBLE_PENDING_DOCTOR";
    } else if (room <= 14) {
      // 2 days fever-free
      daysInFacility = 5 + (room % 3);
      logs = [
        { dayIndex: 1, date: "Day -3", tempC: 38.9, recordedBy: "Nurse Alex", notes: "Moderate viral fatigue" },
        { dayIndex: 2, date: "Day -2", tempC: 38.4, recordedBy: "Nurse Maria", notes: "Fever easing" },
        { dayIndex: 3, date: "Day -1", tempC: 37.2, recordedBy: "Nurse Sarah", notes: "Afebrile Day 1" },
        { dayIndex: 4, date: "Today", tempC: 37.0, recordedBy: "Nurse Sarah", notes: "Afebrile Day 2" }
      ];
      isTempTakenToday = true;
      isDoctorVisitedToday = room % 3 === 0;
    } else if (room <= 24) {
      // 1 day fever-free
      daysInFacility = 4 + (room % 4);
      logs = [
        { dayIndex: 1, date: "Day -3", tempC: 39.4, recordedBy: "Nurse Maria", notes: "High fever, body aches" },
        { dayIndex: 2, date: "Day -2", tempC: 38.9, recordedBy: "Nurse Sarah", notes: "Persistent fever" },
        { dayIndex: 3, date: "Day -1", tempC: 38.3, recordedBy: "Nurse Alex", notes: "Mild reduction" },
        { dayIndex: 4, date: "Today", tempC: 37.4, recordedBy: "Nurse Alex", notes: "Afebrile Day 1 recorded" }
      ];
      isTempTakenToday = room % 2 === 0;
      isDoctorVisitedToday = false;
    } else if (room <= 50) {
      // Active fever, fluctuating
      daysInFacility = 3 + (room % 5);
      const todayTemp = 38.2 + ((room % 8) * 0.2);
      logs = [
        { dayIndex: 1, date: "Day -2", tempC: 39.0, recordedBy: "Nurse Sarah", notes: "High fever" },
        { dayIndex: 2, date: "Day -1", tempC: 38.6, recordedBy: "Nurse Alex", notes: "Fever ongoing" }
      ];
      // Half have temp taken today, half waiting
      if (room % 2 === 0) {
        logs.push({ dayIndex: 3, date: "Today", tempC: Number(todayTemp.toFixed(1)), recordedBy: "Nurse Maria", notes: "Fever continues. Headache reported." });
        isTempTakenToday = true;
        isDoctorVisitedToday = room % 4 === 0;
      }
    } else {
      // High fever, newer patients
      daysInFacility = 1 + (room % 3);
      const highTemp = 38.7 + ((room % 9) * 0.15);
      logs = [
        { dayIndex: 1, date: "Day -1", tempC: 39.2, recordedBy: "Nurse Alex", notes: "Admission triage" }
      ];
      if (room % 3 === 0) {
        logs.push({ dayIndex: 2, date: "Today", tempC: Number(highTemp.toFixed(1)), recordedBy: "Nurse Sarah", notes: "Rigors and sweats" });
        isTempTakenToday = true;
        isDoctorVisitedToday = false;
      }
    }

    const feverFreeStreak = calculateFeverFreeDays(logs);
    
    // Determine overall workflow status for today
    let workflowStatus = "NEEDS_TEMP";
    if (dischargeStatus === "DOCTOR_APPROVED" || dischargeStatus === "ELIGIBLE_PENDING_DOCTOR") {
      workflowStatus = "DISCHARGE_READY";
    } else if (isTempTakenToday && isDoctorVisitedToday) {
      workflowStatus = "COMPLETED_TODAY";
    } else if (isTempTakenToday) {
      workflowStatus = "READY_FOR_DOCTOR";
    } else {
      workflowStatus = "NEEDS_TEMP";
    }

    const wing = room <= 25 ? "Wing A (Rooms 1-25)" : room <= 50 ? "Wing B (Rooms 26-50)" : "Wing C (Rooms 51-74)";

    patients.push({
      id: `P-${1000 + room}`,
      roomNumber: room,
      wing,
      name: `${firstName} ${lastName}`,
      age,
      gender,
      daysInFacility,
      admissionDate: new Date(Date.now() - daysInFacility * 86400000).toISOString().split('T')[0],
      tempLogs: logs,
      isTempTakenToday,
      isDoctorVisitedToday,
      feverFreeStreak,
      dischargeStatus,
      workflowStatus,
      status: "ACTIVE", // ACTIVE, DISCHARGED, DECEASED
      symptoms: feverFreeStreak >= 3 ? ["Recovering", "Asymptomatic"] : ["Prolonged Fever", "Fatigue", "Cough"],
      currentMedications: ["Hydration IV", "Remdesivir / Antiviral", "Paracetamol 500mg (PRN)"],
      doctorNotes: isDoctorVisitedToday 
        ? "Patient evaluated during morning rounds. Chest clear, vitals stable, continuing symptomatic monitoring." 
        : "",
      doctorName: isDoctorVisitedToday ? "Dr. Chen" : "",
      lastVisitedTime: isDoctorVisitedToday ? "11:20 AM" : null
    });
  }

  return patients;
}

// Initial historical outcomes to establish the center's mortality tracking vs 15% benchmark
export function generateInitialHistory() {
  return {
    dischargedCured: 52,
    deceased: 8,
    totalDischarges: 60,
    // Mortality = 8 / 60 = 13.33% (within the 15% expected benchmark!)
    historicalLog: [
      { id: "H-101", name: "Robert Davies", room: 14, age: 62, outcome: "DECEASED", date: "2026-10-18", cause: "Acute respiratory distress syndrome secondary to viral load", daysStayed: 6 },
      { id: "H-102", name: "Maria Garcia", room: 8, age: 34, outcome: "CURED", date: "2026-10-19", cause: "3 full days afebrile, viral clearance confirmed", daysStayed: 8 },
      { id: "H-103", name: "Arthur Vance", room: 42, age: 74, outcome: "DECEASED", date: "2026-10-19", cause: "Multi-organ involvement", daysStayed: 9 },
      { id: "H-104", name: "Sarah Jenkins", room: 29, age: 41, outcome: "CURED", date: "2026-10-20", cause: "3 full days afebrile", daysStayed: 7 },
      { id: "H-105", name: "Leo Zimmerman", room: 55, age: 29, outcome: "CURED", date: "2026-10-21", cause: "3 full days afebrile", daysStayed: 6 },
      { id: "H-106", name: "Grace O'Connor", room: 63, age: 81, outcome: "DECEASED", date: "2026-10-21", cause: "Cardiac arrest secondary to high fever & cytokine storm", daysStayed: 11 },
      { id: "H-107", name: "David Kim", room: 19, age: 48, outcome: "CURED", date: "2026-10-22", cause: "3 full days afebrile", daysStayed: 9 }
    ]
  };
}
