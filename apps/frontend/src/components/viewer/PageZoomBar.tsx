'use client';
import { Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  currentPage: number;
  totalPages: number;
  scale: number;
  onPageChange: (p: number) => void;
  onScaleChange: (s: number) => void;
}

export function PageZoomBar({ currentPage, totalPages, scale, onPageChange, onScaleChange }: Props) {
  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-white rounded-full shadow-[0_2px_10px_rgba(71,85,105,0.18)] border border-slate-200 px-3 py-1.5">
      {/* Page indicator + nav */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="p-1 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-30"
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-[13px] text-slate-500 tabular-nums">
          Pg. <span className="font-semibold text-slate-900">{currentPage}</span> / {totalPages || 1}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="p-1 rounded hover:bg-slate-100 text-slate-500 disabled:opacity-30"
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-5 bg-slate-200" />

      {/* Zoom pill */}
      <div className="flex items-center gap-2 bg-slate-100 rounded-full px-1 py-0.5">
        <button
          onClick={() => onScaleChange(Math.max(0.5, scale - 0.25))}
          className="p-1.5 rounded-full hover:bg-slate-200 text-slate-600"
          title="Zoom out"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="text-[13px] text-slate-700 w-11 text-center tabular-nums">{Math.round(scale * 100)}%</span>
        <button
          onClick={() => onScaleChange(Math.min(3, scale + 0.25))}
          className="p-1.5 rounded-full hover:bg-slate-200 text-slate-600"
          title="Zoom in"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
