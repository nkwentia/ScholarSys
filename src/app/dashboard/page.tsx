// src/app/dashboard/page.tsx
// Phase 1: Operational database dashboard with financial sheets & CRUD

import { supabase } from '@/lib/supabase';
import FinancialSummaryCard from '@/components/dashboard/FinancialSummaryCard';
import StudentCountCard from '@/components/dashboard/StudentCountCard';
import RecentPaymentsTable from '@/components/finance/RecentPaymentsTable';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Fetch summary data server-side
  const { count: studentCount } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  const { data: recentPayments } = await supabase
    .from('payments')
    .select('*, students(first_name, last_name)')
    .order('payment_date', { ascending: false })
    .limit(10);

  const { data: paymentTotals } = await supabase
    .from('payments')
    .select('amount, payment_type, term')
    .eq('academic_year', '2024/2025');

  const totalCollected = paymentTotals?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-brand-900 mb-8">
          SchoolMan Dashboard
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StudentCountCard count={studentCount ?? 0} />
          <FinancialSummaryCard
            title="Total Collected (2024/25)"
            amount={totalCollected}
            currency="XAF"
          />
          <FinancialSummaryCard
            title="This Term"
            amount={
              paymentTotals
                ?.filter((p) => p.term === 1)
                .reduce((s, p) => s + Number(p.amount), 0) ?? 0
            }
            currency="XAF"
          />
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Recent Payments
          </h2>
          <RecentPaymentsTable payments={recentPayments ?? []} />
        </div>
      </div>
    </main>
  );
}
