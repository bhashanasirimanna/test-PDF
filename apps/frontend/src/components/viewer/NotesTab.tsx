'use client';
import { formatDistanceToNow } from 'date-fns';
import type { AnnotationDto } from '@prokoti/types';
import { hexToRgba } from '@/lib/colors';

interface Props {
  notes: AnnotationDto[];
  selectedAnnotationId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
}

export function NotesTab({ notes, selectedAnnotationId, onSelect, onDelete }: Props) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="text-3xl mb-2">📝</div>
        <p className="text-sm font-medium text-slate-600">No notes yet</p>
        <p className="text-xs text-slate-400 mt-1">Select text in the document and click the note icon</p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-2">
      {notes.map((note) => (
        <div
          key={note.id}
          onClick={() => onSelect(note.id)}
          className={`rounded-lg p-3 cursor-pointer transition-all border ${
            selectedAnnotationId === note.id
              ? 'border-indigo-300 bg-indigo-50 shadow-sm'
              : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full shrink-0 mt-0.5"
                style={{ backgroundColor: note.color }}
              />
              <span className="text-xs bg-slate-100 text-slate-500 rounded px-1.5 py-0.5">
                p.{note.pageNumber}
              </span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
              className="text-slate-300 hover:text-red-400 text-xs"
            >×</button>
          </div>

          {note.selectedText && (
            <p
              className="text-xs italic text-slate-500 mt-2 line-clamp-2 rounded px-1.5 py-1"
              style={{ backgroundColor: hexToRgba(note.color, 0.15) }}
            >
              "{note.selectedText.slice(0, 80)}{note.selectedText.length > 80 ? '…' : ''}"
            </p>
          )}

          {note.content && (
            <p className="text-xs text-slate-700 mt-1.5 line-clamp-3">{note.content}</p>
          )}

          <p className="text-xs text-slate-400 mt-1.5">
            {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
          </p>
        </div>
      ))}
    </div>
  );
}
