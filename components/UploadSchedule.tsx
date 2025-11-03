'use client';
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface UploadScheduleProps {
  unitNumber: string;
}

export default function UploadSchedule({ unitNumber }: UploadScheduleProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  async function handleUpload() {
    if (!file) return alert('Please choose a file first.');
    try {
      setUploading(true);

      const ext = file.name.split('.').pop();
      const filePath = `${unitNumber}/${Date.now()}.${ext}`;

      // Upload file to Supabase Storage bucket
      const { error: uploadError } = await supabase.storage
        .from('holiday-uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL of uploaded file
      const { data } = supabase.storage.from('holiday-uploads').getPublicUrl(filePath);
      const url = data.publicUrl;

      setFileUrl(url);

      // Save metadata to uploads table
      const { error: dbError } = await supabase.from('uploads').insert([
        {
          unit_number: unitNumber,
          file_url: url,
          type: 'schedule',
          uploaded_by: 'AVP',
        },
      ]);

      if (dbError) throw dbError;

      alert('Upload successful!');
    } catch (error: any) {
      console.error('Upload failed:', error.message);
      alert('Error uploading file.');
    } finally {
      setUploading(false);
      setFile(null);
    }
  }

  return (
    <div className="p-3 border rounded-xl bg-white shadow-sm">
      <h3 className="text-md font-semibold mb-2">Upload Schedule</h3>

      {fileUrl && (
        <div className="mb-3">
          <img src={fileUrl} alt="Schedule" className="rounded-lg border" />
          <p className="text-xs text-gray-500 mt-1 truncate">{fileUrl}</p>
        </div>
      )}

      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-2"
      />

      <button
        onClick={handleUpload}
        disabled={uploading || !file}
        className={`px-3 py-2 rounded-xl border w-full ${
          uploading ? 'bg-gray-300' : 'bg-yellow-400 hover:bg-yellow-500'
        }`}
      >
        {uploading ? 'Uploading…' : 'Upload File'}
      </button>
    </div>
  );
}
