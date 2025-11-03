'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function UploadButton({ taskStatusId, onUploaded }:{
  taskStatusId: string;
  onUploaded: () => void;
}) {
  const [busy, setBusy] = useState(false);
  async function handleChange(e:React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const filename = `${taskStatusId}/${Date.now()}_${file.name}`;
    const { data: userInfo } = await supabase.auth.getUser();
    const { error: upErr } = await supabase.storage
      .from(process.env.NEXT_PUBLIC_BUCKET!)
      .upload(filename, file, { upsert: false });
    if (upErr) { setBusy(false); return alert(upErr.message); }
    const { data: pub } = supabase.storage.from(process.env.NEXT_PUBLIC_BUCKET!).getPublicUrl(filename);
    await supabase.from('submissions').insert({
      task_status_id: taskStatusId,
      file_url: pub.publicUrl,
      uploaded_by: userInfo.user?.id
    });
    await supabase.from('task_status')
      .update({ status: 'SUBMITTED', submitted_by: userInfo.user?.id, submitted_at: new Date().toISOString() })
      .eq('id', taskStatusId);
    setBusy(false);
    onUploaded();
  }
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <input type="file" className="hidden" onChange={handleChange} accept="image/*,application/pdf" />
      <span className="px-3 py-1 rounded-xl border">{busy ? 'Uploading…' : 'Upload file'}</span>
    </label>
  );
}
