'use client';
import { useEffect, useState } from 'react';
import { getTaskStatus } from '../lib/queries';
import UploadButton from './UploadButton';
import { supabase } from '../lib/supabase';

export default function TaskList({ unit }:{ unit:any }) {
  const [rows, setRows] = useState<any[]>([]);
  async function load(){ setRows(await getTaskStatus(unit.id)); }
  useEffect(() => { load(); }, [unit.id]);

  async function approve(id:string){
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('task_status')
      .update({ status:'APPROVED', approved_by: user?.id, approved_at: new Date().toISOString() })
      .eq('id', id);
    load();
  }
  async function returnForFix(id:string){
    await supabase.from('task_status').update({ status:'RETURNED' }).eq('id', id);
    load();
  }

  return (
    <div className="space-y-3">
      {rows.map(r => (
        <div key={r.id} className="rounded-2xl border p-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-500">{r.tasks.phase} • due {new Date(r.tasks.due_on).toLocaleDateString()}</div>
              <div className="font-semibold">{r.tasks.name}</div>
            </div>
            <div className="text-xs px-2 py-1 rounded-full border">
              {r.status}
            </div>
          </div>

          <div className="mt-3 flex gap-3 items-center">
            {r.tasks.requires_upload && (
              <UploadButton taskStatusId={r.id} onUploaded={load} />
            )}
            <button onClick={() => approve(r.id)} className="px-3 py-1 rounded-xl border">Approve</button>
            <button onClick={() => returnForFix(r.id)} className="px-3 py-1 rounded-xl border">Needs fix</button>
          </div>
        </div>
      ))}
    </div>
  );
}
