'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface SalesLeaderboardProps {
  limit?: number;
}

export default function SalesLeaderboard({ limit = 10 }: SalesLeaderboardProps) {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSales() {
      setLoading(true);
      // 👇 Adjust the table/columns to your schema
      const { data, error } = await supabase
        .from('units')
        .select('number, name, division, district, sales')
        .order('sales', { ascending: false })
        .limit(limit);

      if (error) console.error('Error loading sales leaderboard:', error.message);
      setSales(data || []);
      setLoading(false);
    }
    loadSales();
  }, [limit]);

  if (loading) {
    return <div className="text-gray-500 text-sm italic">Loading leaderboard…</div>;
  }

  return (
    <div className="bg-gray-50 border rounded-xl p-4 shadow-sm mt-8">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">
        🏆 Holiday Sales Leaderboard
      </h3>

      {sales.length === 0 ? (
        <p className="text-gray-500 text-sm italic">No sales data found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-yellow-400 text-black text-left">
                <th className="py-2 px-3 border-b border-gray-300">#</th>
                <th className="py-2 px-3 border-b border-gray-300">Unit</th>
                <th className="py-2 px-3 border-b border-gray-300">Sales</th>
                <th className="py-2 px-3 border-b border-gray-300 hidden sm:table-cell">
                  Division
                </th>
                <th className="py-2 px-3 border-b border-gray-300 hidden sm:table-cell">
                  District
                </th>
              </tr>
            </thead>
            <tbody>
              {sales.map((u, i) => (
                <tr
                  key={u.number}
                  className={`${
                    i === 0
                      ? 'bg-yellow-100 font-semibold'
                      : i < 3
                      ? 'bg-yellow-50'
                      : ''
                  } hover:bg-gray-100`}
                >
                  <td className="py-2 px-3 border-b border-gray-200">{i + 1}</td>
                  <td className="py-2 px-3 border-b border-gray-200 font-medium">
                    {u.number} – {u.name}
                  </td>
                  <td className="py-2 px-3 border-b border-gray-200">
                    ${Number(u.sales || 0).toLocaleString()}
                  </td>
                  <td className="py-2 px-3 border-b border-gray-200 hidden sm:table-cell">
                    {u.division}
                  </td>
                  <td className="py-2 px-3 border-b border-gray-200 hidden sm:table-cell">
                    {u.district}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-3 italic">
        Rankings update automatically as unit sales are reported.
      </p>
    </div>
  );
}
