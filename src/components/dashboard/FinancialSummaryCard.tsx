// src/components/dashboard/FinancialSummaryCard.tsx
interface Props {
  title: string;
  amount: number;
  currency?: string;
}

export default function FinancialSummaryCard({ title, amount, currency = 'XAF' }: Props) {
  const formatted = new Intl.NumberFormat('fr-CM', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);

  return (
    <div className="bg-white rounded-xl shadow p-6 border-l-4 border-brand-600">
      <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">{title}</p>
      <p className="text-3xl font-bold text-brand-700 mt-2">{formatted}</p>
    </div>
  );
}
