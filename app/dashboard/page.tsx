'use client';
import { useEffect, useState } from 'react';
import { getMe, getUnitsForProfile } from '../../lib/queries';
import TaskList from '../../components/TaskList';
import ShowupGrid from '../../components/ShowupGrid';
import UploadSchedule from '../../components/UploadSchedule';

{/* Example: inside a unit card */}
<div className="mt-4">
  <UploadSchedule unitNumber={active.number} />
</div>


export default function Dashboard() {
  const [me, setMe] = useState<any>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const p = await getMe();
      setMe(p);
      const u = await getUnitsForProfile(p);
      setUnits(u);
      setActive(u[0] || null);
    })();
  }, []);

  if (!me) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <div className="text-sm text-gray-500">Signed in as</div>
          <div className="font-semibold">{me.full_name} • {me.role}</div>
        </div>
        {units.length > 0 && (
          <select className="border rounded-xl px-3 py-2"
            value={active?.id || ''} onChange={e => setActive(units.find(u=>u.id===e.target.value))}>
            {units.map(u => <option key={u.id} value={u.id}>{u.number} • {u.name || u.district}</option>)}
          </select>
        )}
      </div>

      {active && (
        <>
          <TaskList unit={active} />
          <ShowupGrid unit={active} />
        </>
      )}
    </div>
  );

}
