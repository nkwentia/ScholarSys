// src/components/dashboard/StudentCountCard.tsx
interface Props {
  count: number;
}

export default function StudentCountCard({ count }: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
      <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Active Students</p>
      <p className="text-3xl font-bold text-green-700 mt-2">{count.toLocaleString()}</p>
    </div>
  );
}
