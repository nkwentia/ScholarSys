// src/app/dashboard/page.tsx
// Phase 1: Operational database dashboard with financial sheets & CRUD

import { supabase } from '@/lib/supabase';
import { processVoucher } from './actions';
import { 
  Wallet, 
  Users, 
  PlusCircle, 
  Clock, 
  TrendingUp 
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // 1. Fetch live data server-side from your Supabase migration tables
  const { count: studentCount } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  const { data: recentPayments } = await supabase
    .from('payments')
    .select('*, students(first_name, last_name, classes(name))')
    .order('created_at', { ascending: false })
    .limit(10);

  const { data: paymentTotals } = await supabase
    .from('payments')
    .select('amount, payment_type, term')
    .eq('academic_year', '2025/2026'); // Track active cycle

  // 2. Perform safe aggregations for the KPI cards
  const totalCollected = paymentTotals?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;
  const ptaCollected = paymentTotals?.filter(p => p.payment_type === 'pta').reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;
  const currentTermCollected = paymentTotals?.filter(p => p.term === 1).reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;

  // 3. Formatted array matching the optimized layout configuration
  const stats = [
    { name: 'Total Collected (25/26)', value: `FCFA ${totalCollected.toLocaleString()}`, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Active Students', value: (studentCount ?? 0).toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'PTA Funds Levied', value: `FCFA ${ptaCollected.toLocaleString()}`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { name: 'Current Term Collections', value: `FCFA ${currentTermCollected.toLocaleString()}`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
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
          <button className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 transition-colors">
            <PlusCircle className="h-4 w-4" />
            Collect Payment
          </button>
        </div>
      </div>

      {/* Analytics KPI Card Grid */}
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
              </div>
            </div>
          );
        })}
      </div>

      {/* Workspace Split */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Live Daily Collections Ledger */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Daily Collections Ledger</h2>
              <p className="text-xs text-slate-500">Most recent real-time structural entries fetched from Supabase.</p>
            </div>
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
                {recentPayments && recentPayments.length > 0 ? (
                  recentPayments.map((payment: any) => (
                    <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-medium text-slate-900">
                        {payment.students ? `${payment.students.first_name} ${payment.students.last_name}` : 'Unknown Student'}
                      </td>
                      <td className="p-3 text-slate-600">
                        {payment.students?.classes?.name ?? 'Unassigned'}
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 uppercase">
                          {payment.payment_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-900">
                        FCFA {Number(payment.amount).toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-mono text-xs text-slate-400">
                        {payment.receipt_number}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-sm text-slate-400">
                      No recent payments found. Use the voucher panel to register transactional logs.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Action Interactive Voucher Form */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Fast Voucher</h2>
          <p className="text-xs text-slate-500 mb-4">Direct receipt window for rapid counter operations.</p>
          
          <form action={processVoucher} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Matricule / Student Number</label>
              <input 
                name="studentNumber"
                type="text" 
                required
                placeholder="e.g. STU2026001" 
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-900 focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Amount (FCFA)</label>
              <input 
                name="amount"
                type="number" 
                required
                placeholder="Amount paid" 
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-900 focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Payment Allocation</label>
              <select 
                name="paymentType"
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-900 focus:outline-none bg-white"
              >
                <option value="school_fees">school_fees</option>
                <option value="pta">pta</option>
                <option value="exam_fees">exam_fees</option>
                <option value="uniform">uniform</option>
              </select>
            </div>
            <button 
              type="submit"
              className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white shadow hover:bg-slate-800 transition-colors mt-2"
            >
              Process Voucher
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}