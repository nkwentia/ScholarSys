// src/app/dashboard/timetable/page.tsx
// Phase 3: Scheduling & I/O — Visual timetable grid with CSS print styles

'use client';

import { useRef } from 'react';
import type { DayOfWeek, Period, TimetableSlot } from '@/types';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS: Period[] = [1, 2, 3, 4, 5, 6, 7, 8];

// Mock data — replace with Supabase fetch
const MOCK_SLOTS: TimetableSlot[] = [
  { id: '1', class_id: 'c1', subject_id: 's1', teacher_id: 't1', day: 'Monday', period: 1, academic_year: '2024/2025', term: 1, room: 'R1' },
  { id: '2', class_id: 'c1', subject_id: 's2', teacher_id: 't2', day: 'Monday', period: 2, academic_year: '2024/2025', term: 1, room: 'R2' },
  { id: '3', class_id: 'c1', subject_id: 's3', teacher_id: 't3', day: 'Tuesday', period: 1, academic_year: '2024/2025', term: 1 },
];

const SUBJECT_NAMES: Record<string, string> = {
  s1: 'Mathematics', s2: 'English', s3: 'Physics', s4: 'Chemistry',
};
const TEACHER_NAMES: Record<string, string> = {
  t1: 'Mr. Nkwenti', t2: 'Mrs. Akor', t3: 'Mr. Bih',
};

export default function TimetablePage() {
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    window.print();
  }

  // Build grid
  const grid: Record<DayOfWeek, Record<Period, TimetableSlot | null>> = {} as any;
  for (const day of DAYS) {
    grid[day] = {} as any;
    for (const period of PERIODS) grid[day][period] = null;
  }
  for (const slot of MOCK_SLOTS) {
    grid[slot.day][slot.period] = slot;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Class Timetable</h1>
        <button
          onClick={handlePrint}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 print:hidden"
        >
          Print Timetable
        </button>
      </div>

      <div ref={printRef} className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-brand-900 text-white">
              <th className="p-3 text-left w-20">Period</th>
              {DAYS.map((day) => (
                <th key={day} className="p-3 text-left">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map((period) => (
              <tr key={period} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3 font-semibold text-gray-500 text-center">{period}</td>
                {DAYS.map((day) => {
                  const slot = grid[day][period];
                  return (
                    <td key={day} className="p-3">
                      {slot ? (
                        <div className="bg-brand-50 border border-brand-200 rounded-lg p-2">
                          <p className="font-semibold text-brand-800 text-xs">
                            {SUBJECT_NAMES[slot.subject_id] ?? slot.subject_id}
                          </p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {TEACHER_NAMES[slot.teacher_id] ?? slot.teacher_id}
                          </p>
                          {slot.room && (
                            <p className="text-gray-400 text-xs">{slot.room}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-200">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CSS Print Styles */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #__next, .print-area, .print-area * { visibility: visible; }
          .print\\:hidden { display: none !important; }
          table { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}
