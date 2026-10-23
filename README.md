# AEGIS-74 | Virus Quarantine & Facility Management System

A high-efficiency patient tracking, clinical workflow coordination, and mortality benchmark monitoring app designed specifically for viral quarantine facilities operating at full occupancy.

---

## 🏥 Addressing the Head Doctor's Problem Statement

| Head Doctor's Pain Point | System Solution in AEGIS-74 |
| :--- | :--- |
| **"No one knows which patients have had their temperatures measured."** | **Step 1 Nurse Queue**: Clearly separates patients into *Pending Temp* vs *Ready for Doctor*. Prevents missed checks and warns on duplicate readings for the same day. |
| **"Doctor visits are erratic; doctors visit before temperature is taken and waste time."** | **Step 2 Doctor Queue**: Doctors are presented only with patients whose morning temperature is *already recorded*. If a doctor attempts to visit a pending patient, a warning banner alerts them to prioritize ready patients. |
| **"Patients stay an extra day or two because doctors fail to promptly inform admin about discharges."** | **Automated 3-Day Fever-Free Engine**: Automatically detects when a patient achieves 3 consecutive afebrile days (<38.0°C / <100.4°F), alerts the physician for 1-click clinical approval, and transmits a real-time bed release notification to Admin Staff. |
| **"We have rooms for up to 74 patients, which are currently at full occupancy."** | **74-Room Interactive Capacity Grid**: Visual map covering Wings A, B, and C with room-by-room status (Fever, Normal, 3-Day Afebrile, Vacant) and quick admission for freed beds. |
| **"No way of measuring our performance against the 15% mortality / 85% success benchmark."** | **Quality & Benchmark Tracker**: Computes real-time center mortality vs 15.0% expected benchmark and triggers an emergency clinical audit banner if the threshold is exceeded. |

---

## 🚀 Key Functional Modules & Screens

### 1. Daily Rounds Coordination Board (Kanban Workflow)
* **Stage 1 (Pending Temp)**: Filterable nurse checklist of all rooms awaiting morning temperature measurement.
* **Stage 2 (Ready for Doctor)**: Displays today's morning temperature, fever status badge, and examination button.
* **Stage 3 (Rounds Completed Today)**: Archive of patients evaluated by both nurse and doctor for today.
* **Stage 4 (3-Day Fever-Free Discharge)**: Highlighted candidates ready for doctor sign-off and admin bed release.

### 2. 74-Room Facility Capacity & Map
* Visual interactive layout of all 74 quarantine rooms across **Wing A (1-25)**, **Wing B (26-50)**, and **Wing C (51-74)**.
* Live status indicators:
  - 🔴 Fever (≥38.0°C / 100.4°F)
  - 🟢 Afebrile (<38.0°C / 100.4°F)
  - 🏆 3-Day Fever-Free (Discharge Candidate)
  - ⚪ Vacant Bed (Ready for admission)
  - 🌡️ Morning Temp Taken Today
  - 🩺 Doctor Visited Today

### 3. Automated Discharge Administration
* **Clinical Sign-off Queue**: Evaluates daily temperature logs; requires physician 1-click sign-off.
* **Admin Bed Release Queue**: Eliminates delayed discharge notifications. Admin finalizes discharge, marks outcome as `CURED`, and immediately frees the bed for waiting patients.
* **Patient Intake**: Fast intake modal to allocate incoming patients to newly vacant rooms.

### 4. Quality & Mortality Benchmark Analytics
* **Mortality Rate vs 15.0% Benchmark**: Real-time gauge comparing center deaths to expected viral mortality.
* **Cure Rate vs 85.0% Benchmark**: Real-time gauge of cured discharges.
* **Emergency Audit Banner**: Automatically activates if center mortality exceeds 15%.
* **Temperature Profile Distribution**: Categorizes active patients by afebrile, moderate fever, and severe fever.
* **Historical Outcomes Log**: Audit table of all completed patient records.

### 5. Multi-Day Simulation Mode
* **"Advance to Next Day"** button: Simulates transitioning into the next operational morning round. Daily checklists reset, allowing users to test multi-day temperature logging and observe patients reaching the 3-day fever-free discharge threshold!

---

## 💻 Tech Stack & Architecture

* **Framework**: React 19 (Single Page Application)
* **Build Tool**: Vite 8
* **Styling**: Tailwind CSS
* **Icons**: Lucide React
* **Persistence**: Client-side Reactive State with `localStorage` fallback and reset capability

---

## 🏃 Running the Application

The application is already built and running locally:

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Access in browser
http://127.0.0.1:3000/
```
