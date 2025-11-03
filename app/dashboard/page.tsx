'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { getMe, getUnitsForProfile } from '../../lib/queries';
import TaskList from '../../components/TaskList';
import ShowupGrid from '../../components/ShowupGrid';
import UploadSchedule from '../../components/UploadSchedule';
import SalesLeaderboard from '../../components/SalesLeaderboard';

export default function Dashboard() {
  const [me, setMe] = useState<any>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // Try to fetch logged-in profile
      const profile = await getMe();
      setMe(profile);

      let unitData = [];

      if (profile) {
        // Authenticated user (AVP or Division)
        unitData = await getUnitsForProfile(profile);
      } else {
        // Public viewer – show all units
        const { data, error } = await supabase
          .from('units')
          .select('*')
          .order('number');

        if (error) console.error('Error fetching public units:', error.message);
        unitData = data || [];
      }

      setUnits(unitData);
      setActive(unitData[0] || null);
      setLoading(false);
    })();
  }, []);

  if (loading)
    return <div className="p-6 text-gray-500">Loading dashboard…</div>;

  if (!active)
    return (
      <div className="p-6 text-red-500">
        No units found. (Check your Supabase data.)
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Holiday Dashboard
          </h1>
          {me ? (
            <div className="text-sm text-green-700 font-medium">
              Logged in as {me.full_name} ({me.role})
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">
              Public View – read-only
            </div>
          )}
        </div>

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

      {/* Active Unit Card */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          {active.name} ({active.number})
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Division: {active.division || '—'} | District:{' '}
          {active.district || '—'}
        </p>

        {/* Show-Up Grid */}
        <ShowupGrid unit={active} />

        {/* Task List */}
        <div className="mt-6">
          <TaskList unit={active} me={me} />
        </div>

        {/* Upload Schedule */}
        <div className="mt-6">
          <UploadSchedule unitNumber={active.number} me={me} />
        </div>
      </div>
{/* 🏆 Sales Leaderboard */}
<SalesLeaderboard limit={10} />

      {/* Footer / Hint */}
      {!me && (
        <div className="text-center text-gray-400 text-sm mt-8">
          Log in as an AVP or Division Manager to approve uploads and manage
          progress.
        </div>
      )}
    </div>
  );
}
