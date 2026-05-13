'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { DocumentDto } from '@prokoti/types';
import { Avatar } from '@/components/ui/Avatar';

const FILE_BADGE: Record<string, string> = {
  'application/pdf': 'PDF',
  'text/plain': 'TXT',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [documents, setDocuments] = useState<DocumentDto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    api.get<DocumentDto[]>('/documents').then(setDocuments).catch(console.error);
  }, []);

  const onDrop = useCallback(async (accepted: File[]) => {
    for (const file of accepted) {
      const formData = new FormData();
      formData.append('file', file);
      setUploading(true);
      setUploadProgress(0);

      // Simulate progress while uploading
      const interval = setInterval(() => setUploadProgress((p) => Math.min(p + 10, 90)), 200);

      try {
        const doc = await api.upload<DocumentDto>('/documents/upload', formData);
        setDocuments((prev) => [doc, ...prev]);
        toast.success(`${file.name} uploaded successfully`);
      } catch (err: any) {
        toast.error(`Upload failed: ${err.message}`);
      } finally {
        clearInterval(interval);
        setUploadProgress(100);
        setTimeout(() => { setUploading(false); setUploadProgress(0); }, 500);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    },
    multiple: true,
  });

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">P</span>
          </div>
          <span className="font-semibold text-slate-900">Prokoti</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600">{user?.name}</span>
          <Avatar name={user?.name || ''} url={user?.avatarUrl} size={32} />
          <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-700">Sign out</button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Documents</h1>

        {/* Upload Zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors mb-8 ${
            isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="text-4xl mb-3">📄</div>
          <p className="text-slate-700 font-medium">
            {isDragActive ? 'Drop files here' : 'Drag & drop files, or click to select'}
          </p>
          <p className="text-sm text-slate-400 mt-1">PDF, TXT, PPTX — max 50MB</p>
        </div>

        {uploading && (
          <div className="mb-6">
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-slate-500 mt-1">Uploading...</p>
          </div>
        )}

        {/* Document Grid */}
        {documents.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-lg font-medium">No documents yet</p>
            <p className="text-sm mt-1">Upload a PDF, TXT, or PPTX file to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <Link
                key={doc.id}
                href={`/viewer/${doc.id}`}
                className="card p-4 hover:shadow-md transition-shadow cursor-pointer block"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-12 bg-red-50 rounded-lg flex items-center justify-center border border-red-100">
                    <span className="text-xs font-bold text-red-600">
                      {FILE_BADGE[doc.mimeType] || 'PDF'}
                    </span>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                    {FILE_BADGE[doc.mimeType] || 'PDF'}
                  </span>
                </div>
                <h3 className="font-medium text-slate-900 text-sm line-clamp-2 mb-2">{doc.name}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Avatar name={doc.uploadedBy?.name || ''} url={doc.uploadedBy?.avatarUrl} size={16} />
                  <span>{doc.uploadedBy?.name}</span>
                  <span>·</span>
                  <span>{formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
