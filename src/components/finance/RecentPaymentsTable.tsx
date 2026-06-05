// src/components/finance/RecentPaymentsTable.tsx
'use client';

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  payment_type: string;
  receipt_number: string;
  students: { first_name: string; last_name: string } | null;
}

interface Props {
  payments: Payment[];
}

export default function RecentPaymentsTable({ payments }: Props) {
  if (payments.length === 0) {
    return <p className="text-gray-500 text-sm">No payments recorded yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-4 py-3">Student</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Amount (XAF)</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Receipt</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {payments.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">
                {p.students
                  ? `${p.students.first_name} ${p.students.last_name}`
                  : '—'}
              </td>
              <td className="px-4 py-3 capitalize text-gray-600">
                {p.payment_type.replace('_', ' ')}
              </td>
              <td className="px-4 py-3 text-brand-700 font-semibold">
                {Number(p.amount).toLocaleString()}
              </td>
              <td className="px-4 py-3 text-gray-500">{p.payment_date}</td>
              <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                {p.receipt_number}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
