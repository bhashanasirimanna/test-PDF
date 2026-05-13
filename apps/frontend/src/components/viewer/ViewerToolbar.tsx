'use client';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Props {
  documentName: string;
  currentPage: number;
  totalPages: number;
  scale: number;
  leftOpen: boolean;
  rightOpen: boolean;
  placingSignature: boolean;
  documentId: string;
  userName: string;
  onPageChange: (p: number) => void;
  onScaleChange: (s: number) => void;
  onToggleLeft: () => void;
  onToggleRight: () => void;
  onSignClick: () => void;
}

export function ViewerToolbar({
  documentName, currentPage, totalPages, scale, leftOpen, rightOpen,
  placingSignature, documentId, userName,
  onPageChange, onScaleChange, onToggleLeft, onToggleRight, onSignClick,
}: Props) {
  const zoomLevels = [0.5, 0.75, 1, 1.25, 1.5, 2, 3];

  function handleDownload() {
    const a = document.createElement('a');
    a.href = api.getDownloadUrl(documentId);
    a.download = documentName;
    a.click();
  }

  function handlePrint() {
    window.open(api.getPrintUrl(documentId), '_blank');
  }

  return (
    <header className="h-12 bg-white border-b border-slate-200 flex items-center px-3 gap-2 shrink-0 z-10">
      {/* Back */}
      <Link href="/dashboard" className="text-slate-500 hover:text-slate-700 p-1 rounded" title="Back to dashboard">
        ←
      </Link>

      {/* Toggle left sidebar */}
      <button
        onClick={onToggleLeft}
        className={`p-1.5 rounded text-sm ${leftOpen ? 'bg-slate-100 text-slate-700' : 'text-slate-400'}`}
        title="Toggle thumbnails"
      >
        ☰
      </button>

      <div className="w-px h-5 bg-slate-200 mx-1" />

      {/* Document name */}
      <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{documentName}</span>

      <div className="flex-1" />

      {/* Zoom controls */}
      <button
        onClick={() => onScaleChange(Math.max(0.5, scale - 0.25))}
        className="p-1.5 rounded hover:bg-slate-100 text-slate-600 text-sm font-mono"
        title="Zoom out"
      >−</button>
      <span className="text-xs text-slate-600 w-12 text-center">{Math.round(scale * 100)}%</span>
      <button
        onClick={() => onScaleChange(Math.min(3, scale + 0.25))}
        className="p-1.5 rounded hover:bg-slate-100 text-slate-600 text-sm font-mono"
        title="Zoom in"
      >+</button>
      {/* <button
        onClick={() => onScaleChange(1.0)}
        className="text-xs px-2 py-1 rounded hover:bg-slate-100 text-slate-500"
        title="Fit to width"
      >Fit</button> */}

      <div className="w-px h-5 bg-slate-200 mx-1" />

      {/* Page nav */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-600 disabled:opacity-30 text-sm"
        >‹</button>
        <input
          type="number"
          min={1}
          max={totalPages || 1}
          value={currentPage}
          onChange={(e) => {
            const p = parseInt(e.target.value, 10);
            if (p >= 1 && p <= totalPages) onPageChange(p);
          }}
          className="w-10 text-center text-xs border border-slate-300 rounded py-0.5"
        />
        <span className="text-xs text-slate-400">/ {totalPages}</span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded hover:bg-slate-100 text-slate-600 disabled:opacity-30 text-sm"
        >›</button>
      </div>

      <div className="w-px h-5 bg-slate-200 mx-1" />

      {/* Signature */}
      <button
        onClick={onSignClick}
        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
          placingSignature ? 'bg-amber-100 text-amber-700' : 'hover:bg-slate-100 text-slate-500'
        }`}
        title={placingSignature ? 'Cancel signature placement' : 'Add signature'}
      >
        ✏️ Sign
      </button>

      {/* Download / Print */}
      <button onClick={handleDownload} className="px-2 py-1 rounded text-xs hover:bg-slate-100 text-slate-600" title="Download with watermark">
        ⬇ Download
      </button>
      <button onClick={handlePrint} className="px-2 py-1 rounded text-xs hover:bg-slate-100 text-slate-600" title="Print with watermark">
        🖨 Print
      </button>

      {/* Toggle right sidebar */}
      <button
        onClick={onToggleRight}
        className={`p-1.5 rounded text-sm ${rightOpen ? 'bg-slate-100 text-slate-700' : 'text-slate-400'}`}
        title="Toggle annotations panel"
      >
        ≡
      </button>
    </header>
  );
}
