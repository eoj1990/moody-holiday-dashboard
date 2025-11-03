'use client';
import { useEffect, useState } from 'react';
import { getMe, getUnitsForProfile } from '../../lib/queries';
import TaskList from '../../components/TaskList';
import ShowupGrid from '../../components/ShowupGrid';
import UploadSchedule from '../../components/UploadSchedule';

export default function Dashboard() {
  const [me, setMe] = useState<any>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const profile = await getMe();
      setMe(profile);

      const u = await getUnitsForProfile(profile);
      setUnits(u);
      setActive(u[0] || null);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="p-6 text-gray-500">Loading dashboard…</div>;
  if (!active) return <div className="p-6 text-red-500">No units found for your profile.</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Holiday Dashboard</h1>
        <div>
          <select
            value={active.number}
            onChange={(e) => {
              const selected = units.find((u) => u.number === e.target.value);
              setActive(selected);
            }}
            className="border rounded-lg px-3 py-2"
          >
            {units.map((u) => (
              <option key={u.id} value={u.number}>
                {u.number} – {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          {active.name} ({active.number})
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Division: {active.division || '—'} | District: {active.district || '—'}
        </p>

        {/* ✅ Show-up grid section */}
        <ShowupGrid unit={active} />

        {/* ✅ Task list section */}
        <div className="mt-6">
          <TaskList unit={active} />
        </div>

        {/* ✅ Upload Schedule section */}
        <div className="mt-6">
          <UploadSchedule unitNumber={active.number} />
        </div>
      </div>
    </div>
  );
}
