'use client';
import { formatDistanceToNow } from 'date-fns';
import type { AnnotationDto } from '@prokoti/types';

interface Props {
  signatures: AnnotationDto[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
}

export function SignaturesTab({ signatures, onSelect, onDelete }: Props) {
  if (signatures.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="text-3xl mb-2">✏️</div>
        <p className="text-sm font-medium text-slate-600">No signatures yet</p>
        <p className="text-xs text-slate-400 mt-1">
          Enable signature mode in the toolbar, draw your signature, and click to place it
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-2">
      {signatures.map((sig) => (
        <div
          key={sig.id}
          onClick={() => onSelect(sig.id)}
          className="rounded-lg border border-slate-200 hover:border-slate-300 p-3 cursor-pointer transition-all"
        >
          <img
            src={sig.content}
            alt="Signature"
            className="w-full h-12 object-contain bg-slate-50 rounded border border-slate-100"
          />
          <div className="flex justify-between items-center mt-1.5">
            <span className="text-xs text-slate-400">Page {sig.pageNumber}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">
                {formatDistanceToNow(new Date(sig.createdAt), { addSuffix: true })}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(sig.id); }}
                className="text-slate-300 hover:text-red-400 text-xs"
              >×</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
