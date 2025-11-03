'use client';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

const DATES = [
  '2025-12-23','2025-12-24','2025-12-25','2025-12-31','2026-01-01'
];
const DAYPARTS = ['1ST','2ND','3RD'];
const ROLES = ['UM','DM','DIV','TRAINEE','SUPERVISOR'];

export default function ShowupGrid({ unit }:{ unit:any }) {
  const [rows, setRows] = useState<any[]>([]);
  const mapKey = (d:string, p:string)=> `${d}_${p}`;

  async function load(){
    const { data } = await supabase.from('showups').select('*').eq('unit_id', unit.id);
    setRows(data||[]);
  }
  useEffect(()=>{ load(); }, [unit.id]);

  const byKey = useMemo(() => {
    const m:any = {};
    rows.forEach(r => m[mapKey(r.date, r.daypart)] = r);
    return m;
  }, [rows]);

  async function save(date:string, daypart:string, shift_change_by:string|null){
    const existing = byKey[mapKey(date, daypart)];
    if (existing) {
      await supabase.from('showups').update({ shift_change_by }).eq('id', existing.id);
    } else {
      await supabase.from('showups').insert({ unit_id: unit.id, date, daypart, shift_change_by });
    }
    load();
  }

  return (
    <div className="rounded-2xl border p-4">
      <div className="font-semibold mb-2">Show-Up Plan</div>
      <div className="overflow-x-auto">
        <table className="min-w-[640px] w-full text-sm">
          <thead>
            <tr>
              <th className="text-left p-2">Date</th>
              {DAYPARTS.map(p => <th key={p} className="text-left p-2">{p}</th>)}
            </tr>
          </thead>
          <tbody>
            {DATES.map(d => (
              <tr key={d} className="border-t">
                <td className="p-2">{new Date(d).toLocaleDateString()}</td>
                {DAYPARTS.map(p => {
                  const v = byKey[mapKey(d,p)]?.shift_change_by || '';
                  return (
                    <td key={p} className="p-2">
                      <select className="border rounded-xl px-2 py-1"
                        value={v} onChange={e => save(d,p,e.target.value||null)}>
                        <option value="">—</option>
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 mt-2">Tip: Assign shift-change coverage (UM/DM/DIV/Trainee). Use 1st & 2nd mgmt coverage rules on Christmas; add 3rd mgmt where projected &gt;$2,500.</p>
    </div>
  );
}
