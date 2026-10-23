import React, { useState } from 'react';
import { useFacility } from '../context/FacilityContext';
import { X, Bed, PlusCircle, CheckCircle2 } from 'lucide-react';

export default function AdmitPatientModal({ initialRoomNumber, onClose }) {
  const { vacantRooms, admitPatient, tempUnit } = useFacility();

  const [roomNumber, setRoomNumber] = useState(initialRoomNumber || (vacantRooms[0]?.roomNumber || ''));
  const [name, setName] = useState('');
  const [age, setAge] = useState('42');
  const [gender, setGender] = useState('Male');
  const [initialTemp, setInitialTemp] = useState('38.9');
  const [notes, setNotes] = useState('Incoming quarantine transfer from emergency triage.');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter patient name.');
      return;
    }

    const numericTemp = parseFloat(initialTemp);
    const tempInC = tempUnit === 'F' ? (((numericTemp - 32) * 5) / 9) : numericTemp;

    const success = admitPatient(roomNumber, {
      name,
      age,
      gender,
      initialTempC: tempInC,
      notes,
      symptoms: ['High Fever', 'Chills', 'Fatigue']
    });

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Bed className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Admit New Quarantine Patient</h3>
              <p className="text-xs text-blue-100">Intake into vacant room</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Room Allocation */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
              Select Vacant Bed
            </label>
            <select
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="w-full text-xs font-bold text-slate-800 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              {vacantRooms.map(r => (
                <option key={r.roomNumber} value={r.roomNumber}>
                  Room {r.roomNumber} ({r.wing})
                </option>
              ))}
            </select>
          </div>

          {/* Patient Name */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
              Patient Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Samuel Henderson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs text-slate-800 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Age & Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Age
              </label>
              <input
                type="number"
                min="1"
                max="105"
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full text-xs text-slate-800 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full text-xs text-slate-800 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Intake Temperature */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
              Intake Temperature (°{tempUnit})
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={initialTemp}
              onChange={(e) => setInitialTemp(e.target.value)}
              className="w-full text-xs text-slate-800 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Admission Notes */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
              Admission Triage Notes
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs text-slate-800 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition active:scale-95 flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Admit to Bed</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
