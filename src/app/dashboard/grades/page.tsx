// src/app/dashboard/grades/page.tsx
// Phase 2: Academic Intelligence — OCR grade upload + manual entry

'use client';

import { useState } from 'react';
import { parseGradeSheetImage, scoreToGradeLetter, computeClassMetrics } from '@/lib/grade-ocr';
import type { ParsedGradeRow } from '@/lib/grade-ocr';

export default function GradesPage() {
  const [parsing, setParsing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rows, setRows] = useState<ParsedGradeRow[]>([]);
  const [metrics, setMetrics] = useState<ReturnType<typeof computeClassMetrics>>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    setProgress(0);
    try {
      const result = await parseGradeSheetImage(file, setProgress);
      setRows(result.rows);
      const scores = result.rows.map((r) => r.score!).filter(Boolean);
      setMetrics(computeClassMetrics(scores));
    } finally {
      setParsing(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Grade Entry — OCR / Manual</h1>

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">Upload Grade Sheet Image</h2>
        <p className="text-sm text-gray-500 mb-4">
          Upload a photo or scan of a handwritten or printed grade sheet. The system will
          automatically parse student names and scores.
        </p>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-600 file:text-white hover:file:bg-brand-700"
        />
        {parsing && (
          <div className="mt-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-brand-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm text-gray-500">{progress}%</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Parsing grade sheet...</p>
          </div>
        )}
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Students', value: metrics.total },
            { label: 'Average', value: `${metrics.average}%` },
            { label: 'Pass Rate', value: `${metrics.passRate}%` },
            { label: 'Highest', value: `${metrics.highest}%` },
          ].map((m) => (
            <div key={m.label} className="bg-white rounded-xl shadow p-4 text-center">
              <p className="text-xs text-gray-500 uppercase">{m.label}</p>
              <p className="text-2xl font-bold text-brand-700">{m.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Parsed Results */}
      {rows.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Parsed Grades ({rows.length} entries)</h2>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Student Name</th>
                <th className="px-4 py-3 text-left">Subject</th>
                <th className="px-4 py-3 text-left">Score</th>
                <th className="px-4 py-3 text-left">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{row.studentName || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{row.subject || '—'}</td>
                  <td className="px-4 py-3 font-semibold">{row.score ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${
                      row.score && row.score >= 50 ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {row.score != null ? scoreToGradeLetter(row.score) : '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
