'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { getMe, getUnitsForProfile } from '../../lib/queries';
import TaskList from '../../components/TaskList';
import ShowupGrid from '../../components/ShowupGrid';
import UploadSchedule from '../../components/UploadSchedule';
import SalesLeaderboard from '../../components/SalesLeaderboard';
import CountdownBanner from '../../components/CountdownBanner';

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
      <div className="min-h-screen bg-[#fffef5] text-gray-900">
        {/* ====== Header ====== */}
        <header className="bg-yellow-400 border-b-4 border-black shadow-md">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center px-4 py-3">
            <div className="flex items-center space-x-3">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/1/16/Waffle_House_logo.svg"
                alt="Waffle House Logo"
                className="h-10 sm:h-12"
              />
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black uppercase">
                Holiday Dashboard
              </h1>
            </div>
    
            {/* User status */}
            <div className="text-sm mt-2 sm:mt-0">
              {me ? (
                <span className="text-green-900 font-semibold bg-green-100 px-2 py-1 rounded">
                  Logged in as {me.full_name} ({me.role})
                </span>
              ) : (
                <span className="italic text-gray-700">
                  Public View – read-only
                </span>
              )}
            </div>
          </div>
        </header>
    
        {/* ====== Countdown Banner ====== */}
        <CountdownBanner />
    
        {/* ====== Main Content ====== */}
        <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
          <div className="flex justify-between items-center">
            <select
              value={active.number}
              onChange={(e) => {
                const selected = units.find((u) => u.number === e.target.value);
                setActive(selected);
              }}
              className="border border-black rounded-lg px-3 py-2 font-medium bg-white"
            >
              {units.map((u) => (
                <option key={u.id} value={u.number}>
                  {u.number} – {u.name}
                </option>
              ))}
            </select>
          </div>
    
          <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {active.name} ({active.number})
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Division: {active.division || '—'} | District:{' '}
              {active.district || '—'}
            </p>
    
            <ShowupGrid unit={active} />
    
            <div className="mt-6">
              <TaskList unit={active} me={me} />
            </div>
    
            <div className="mt-6">
              <UploadSchedule unitNumber={active.number} me={me} />
            </div>
          </div>
    
          <SalesLeaderboard limit={10} />
    
          {!me && (
            <div className="text-center text-gray-400 text-sm mt-8">
              Log in as an AVP or Division Manager to approve uploads and manage
              progress.
            </div>
          )}
        </main>
      </div>
    );
    