'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface UploadScheduleProps {
  unitNumber: string;
  me?: any;
}

export default function UploadSchedule({ unitNumber, me }: UploadScheduleProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploads, setUploads] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load uploads
  async function loadUploads() {
    const { data, error } = await supabase
      .from('uploads')
      .select('*')
      .eq('unit_number', unitNumber)
      .order('uploaded_at', { ascending: false });
    if (error) console.error('Error loading uploads:', error.message);
    else setUploads(data || []);
  }

  useEffect(() => {
    loadUploads();
  }, [unitNumber]);

  const latest = uploads[0];

  // Upload a new schedule
  async function handleUpload() {
    if (!file) return alert('Please select a file first.');
    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${unitNumber}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('holiday-uploads')
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const publicURL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/holiday-uploads/${filePath}`;

      const { error: dbError } = await supabase.from('uploads').insert({
        unit_number: unitNumber,
        file_url: publicURL,
        type: 'schedule',
        uploaded_by: me?.full_name || 'Guest',
        approved: false,
      });
      if (dbError) throw dbError;

      alert('Upload successful!');
      setFile(null);
      await loadUploads();
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert(`Error uploading file: ${error.message || JSON.stringify(error)}`);
    } finally {
      setLoading(false);
    }
  }

  // Approve upload (AVP / DIV only)
  async function handleApprove(id: string) {
    const { error } = await supabase
      .from('uploads')
      .update({ approved: true })
      .eq('id', id);
    if (error) alert('Error approving file.');
    else await loadUploads();
  }

  // Delete upload (AVP / DIV only)
  async function handleDelete(id: string) {
    if (!confirm('Delete this upload?')) return;
    const { error } = await supabase.from('uploads').delete().eq('id', id);
    if (error) alert('Error deleting file.');
    else setUploads((u) => u.filter((x) => x.id !== id));
  }

  return (
    <div className="bg-gray-50 border rounded-xl p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        Schedule Uploads
      </h3>

      {/* Upload input */}
      <div className="flex items-center space-x-2 mb-4">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="text-sm border rounded px-2 py-1"
        />
        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-4 py-1.5 rounded"
        >
          {loading ? 'Uploading…' : 'Upload File'}
        </button>

        {uploads.length > 1 && (
          <button
            onClick={() => setShowModal(true)}
            className="text-blue-600 text-sm underline ml-2"
          >
            View All ({uploads.length})
          </button>
        )}
      </div>

      {/* Latest Upload Preview */}
      {latest ? (
        <div className="relative bg-white border rounded-lg overflow-hidden shadow-sm">
          <img
            src={latest.file_url}
            alt="Latest schedule"
            className="object-cover w-full h-64"
          />
          {latest.approved ? (
            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded shadow">
              ✅ Approved
            </div>
          ) : (
            (me?.role === 'AVP' || me?.role === 'DIV') && (
              <button
                onClick={() => handleApprove(latest.id)}
                className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded shadow hover:bg-green-600"
              >
                Approve
              </button>
            )
          )}

          <div className="p-2 text-sm">
            <p className="font-medium text-gray-700">
              {latest.uploaded_by || 'Unknown'}
            </p>
            <p className="text-gray-500 text-xs">
              {new Date(latest.uploaded_at).toLocaleString()}
            </p>
          </div>

          {(me?.role === 'AVP' || me?.role === 'DIV') && (
            <button
              onClick={() => handleDelete(latest.id)}
              className="absolute bottom-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded hover:bg-red-600"
            >
              Delete
            </button>
          )}
        </div>
      ) : (
        <p className="text-gray-500 text-sm italic">
          No schedules uploaded yet.
        </p>
      )}

      {/* Modal for all uploads */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-3xl w-full relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              ✕
            </button>
            <h4 className="text-lg font-semibold mb-4">
              All Uploads ({unitNumber})
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {uploads.map((u) => (
                <div
                  key={u.id}
                  className="border rounded-lg overflow-hidden relative group"
                >
                  <img
                    src={u.file_url}
                    alt="Upload"
                    className="object-cover w-full h-40"
                  />
                  <div className="p-2 text-xs">
                    <p className="font-medium text-gray-700">
                      {u.uploaded_by || 'Unknown'}
                    </p>
                    <p className="text-gray-500 text-[10px]">
                      {new Date(u.uploaded_at).toLocaleString()}
                    </p>
                  </div>
                  {(me?.role === 'AVP' || me?.role === 'DIV') && (
                    <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition">
                      {!u.approved && (
                        <button
                          onClick={() => handleApprove(u.id)}
                          className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                  {u.approved && (
                    <div className="absolute bottom-1 right-1 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded">
                      ✅ Approved
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
