import React, { useState, useEffect } from 'react';
import { X, Upload, Trash2, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { fetchDocuments, uploadDocument, deleteDocument, reindexKB } from '../services/api';

export default function AdminModal({ isOpen, onClose }) {
  const [password, setPassword] = useState("admin123");
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loadDocs = async () => {
    try {
      const data = await fetchDocuments();
      setDocuments(data.documents);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDocs();
      setStatusMsg("");
      setErrorMsg("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setErrorMsg("");
    setStatusMsg("");
    try {
      const res = await uploadDocument(file, password);
      setStatusMsg(res.message);
      setFile(null);
      loadDocs();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    try {
      await deleteDocument(docId, password);
      loadDocs();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleReindex = async () => {
    if (!confirm("This will clear custom indexed files and reset to seed data. Proceed?")) return;
    try {
      const res = await reindexKB(password);
      setStatusMsg(res.message);
      loadDocs();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-base">Knowledge Base Administration</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Admin Auth */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <label className="text-xs font-semibold text-slate-600 block mb-1">Admin Passcode</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
            />
          </div>

          {statusMsg && (
            <div className="flex items-center space-x-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
              <CheckCircle size={16} />
              <span>{statusMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center space-x-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-xl">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Upload Section */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Ingest Document (.PDF, .TXT, .DOCX)
            </label>
            <form onSubmit={handleUpload} className="flex items-center space-x-3">
              <input
                type="file"
                accept=".pdf,.txt,.docx"
                onChange={(e) => setFile(e.target.files[0])}
                className="text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer"
              />
              <button
                type="submit"
                disabled={!file || uploading}
                className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition"
              >
                <Upload size={14} />
                <span>{uploading ? "Ingesting..." : "Upload & Index"}</span>
              </button>
            </form>
          </div>

          {/* Uploaded Documents List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Indexed Uploads ({documents.length})
              </label>
              <button
                onClick={handleReindex}
                className="text-xs text-rose-600 hover:text-rose-700 flex items-center space-x-1 font-medium"
              >
                <RefreshCw size={12} />
                <span>Reset to Seed Defaults</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              {documents.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No custom documents uploaded. System is running on the 15 default seed documents.
                </div>
              ) : (
                documents.map((doc) => (
                  <div key={doc.id} className="p-3 flex items-center justify-between bg-white hover:bg-slate-50">
                    <div>
                      <p className="text-xs font-medium text-slate-800">{doc.filename}</p>
                      <p className="text-[10px] text-slate-400">
                        {doc.chunk_count} chunks • Indexed {doc.created_at}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="text-xs font-medium text-slate-600 hover:text-slate-800 px-4 py-2 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}