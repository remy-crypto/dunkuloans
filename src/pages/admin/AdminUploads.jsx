import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/SupabaseClient";

export default function AdminUploads() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    const { data, error } = await supabase.storage.from("admin_docs").list();
    if (!error && data) {
      setFiles(data);
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const fileName = `${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("admin_docs").upload(fileName, file);

    if (error) {
      alert("Upload failed: " + error.message);
    } else {
      alert("File uploaded successfully!");
      fetchFiles(); // Refresh list
    }
    setUploading(false);
  };

  const handleDownload = async (fileName) => {
    const { data } = supabase.storage.from("admin_docs").getPublicUrl(fileName);
    if (data) {
      window.open(data.publicUrl, "_blank");
    }
  };

  const handleDelete = async (fileName) => {
    if (!confirm("Delete this file?")) return;
    const { error } = await supabase.storage.from("admin_docs").remove([fileName]);
    if (!error) fetchFiles();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Document Center</h1>

      {/* Upload Zone */}
      <div 
        className="bg-white p-10 rounded-xl border-2 border-dashed border-gray-300 text-center hover:bg-gray-50 transition cursor-pointer"
        onClick={() => fileInputRef.current.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleUpload} 
          className="hidden" 
        />
        
        {uploading ? (
          <div className="text-indigo-600 font-bold animate-pulse">Uploading...</div>
        ) : (
          <>
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
            <h3 className="text-lg font-bold text-gray-700">Upload Documents</h3>
            <p className="text-gray-500 text-sm mt-1">Click to select contracts, policies, or reports.</p>
            <button className="mt-4 px-6 py-2 bg-gray-900 text-white rounded text-sm font-bold">Select Files</button>
          </>
        )}
      </div>

      {/* Recent Files List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 font-bold text-gray-700">Recent Uploads</div>
        <div className="divide-y divide-gray-100">
          {files.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No documents found. Upload one above.</div>
          ) : (
            files.map((file) => (
              <div key={file.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 text-red-600 rounded">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.metadata.size / 1024).toFixed(1)} KB • {new Date(file.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => handleDownload(file.name)} className="text-indigo-600 text-sm font-medium hover:underline">Download</button>
                  <button onClick={() => handleDelete(file.name)} className="text-red-500 text-sm font-medium hover:underline">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}