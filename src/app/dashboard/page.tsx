import React from 'react';
import { 
  Wallet, 
  Users, 
  ArrowUpRight, 
  Receipt, 
  TrendingUp, 
  PlusCircle, 
  Clock 
} from 'lucide-react';

export default function FinancialDashboard() {
  // Static placeholder data for Phase 1 UI blueprint visualization
  const stats = [
    { name: 'Total Fees Collected', value: 'FCFA 12,450,000', change: '+14%', icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Active Students Enrolled', value: '842', change: '+3.2%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'PTA Funds Levied', value: 'FCFA 2,100,000', change: '100%', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { name: 'Outstanding Balances', value: 'FCFA 4,820,000', change: '-8%', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const recentPayments = [
    { id: '1', name: 'Nkwenti Alain', class: 'Form V', amount: 'FCFA 45,000', type: 'Tuition Installment', date: 'Today, 14:22', receipt: 'REC-2026-0482' },
    { id: '2', name: 'Amadou Ibrahim', class: 'LSS CSC', amount: 'FCFA 10,000', type: 'PTA', date: 'Today, 11:05', receipt: 'REC-2026-0481' },
    { id: '3', name: 'Bih Clarisse', class: 'Form I A', amount: 'FCFA 75,000', type: 'School Fees', date: 'Yesterday', receipt: 'REC-2026-0480' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">ScholarSys Finance</h1>
          <p className="text-sm text-slate-500">Real-time tuition tracking, PTA balances, and daily payment monitoring.</p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-850 transition-colors">
            <PlusCircle className="h-4 w-4" />
            Collect Payment
          </button>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="overflow-hidden rounded-xl bg-white p-5 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">{stat.name}</span>
                <div className={`rounded-lg p-2 ${stat.bg}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold tracking-tight text-slate-900">{stat.value}</span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-800`}>
                  <ArrowUpRight className="mr-0.5 h-3 w-3" />
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Workspace Split */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Recent Transactions Table */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Daily Collections Ledger</h2>
              <p className="text-xs text-slate-500">Most recent structural entries logged across payment brackets.</p>
            </div>
            <button className="text-xs font-semibold text-blue-900 hover:underline">View All Ledger Logs</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="p-3">Student</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Payment Bracket</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3 text-right">Receipt ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-medium text-slate-900">{payment.name}</td>
                    <td className="p-3 text-slate-600">{payment.class}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                        {payment.type}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-slate-900">{payment.amount}</td>
                    <td className="p-3 text-right font-mono text-xs text-slate-400">{payment.receipt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Action Payment Allocation Form UI Panel */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Fast Voucher</h2>
          <p className="text-xs text-slate-500 mb-4">Direct receipt window for rapid counter operations.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Matricule / Student Number</label>
              <input type="text" placeholder="e.g. STU2026001" className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-900 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Amount (FCFA)</label>
              <input type="number" placeholder="Amount paid" className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-900 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Payment Allocation</label>
              <select className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-900 focus:outline-none bg-white">
                <option>school_fees</option>
                <option>pta</option>
                <option>exam_fees</option>
                <option>uniform</option>
              </select>
            </div>
            <button className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white shadow hover:bg-slate-800 transition-colors mt-2">
              Process Voucher
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}