'use client';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { AnnotationDto } from '@prokoti/types';
import { hexToRgba } from '@/lib/colors';
import { ShareAsDiscussionModal } from './ShareAsDiscussionModal';

interface Props {
  notes: AnnotationDto[];
  selectedAnnotationId: string | null;
  userId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onShare: (id: string, memberIds: string[]) => Promise<any>;
  documentName?: string;
}

export function NotesTab({ notes, selectedAnnotationId, userId, onSelect, onDelete, onShare, documentName }: Props) {
  const [sharingNoteId, setSharingNoteId] = useState<string | null>(null);

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="text-3xl mb-2">📝</div>
        <p className="text-sm font-medium text-slate-600">No notes yet</p>
        <p className="text-xs text-slate-400 mt-1">Select text in the document and click the note icon</p>
      </div>
    );
  }

  const sharingNote = sharingNoteId ? notes.find((n) => n.id === sharingNoteId) : null;

  return (
    <>
      <div className="p-3 space-y-3">
        {notes.map((note) => (
          <div
            key={note.id}
            onClick={() => onSelect(note.id)}
            className={`rounded-xl overflow-hidden cursor-pointer transition-shadow bg-white ${
              selectedAnnotationId === note.id
                ? 'shadow-[0_0_0_2px_#a5b4fc,0_2px_8px_rgba(0,0,0,0.08)]'
                : 'shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_14px_rgba(0,0,0,0.12)]'
            }`}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-[10px] pt-[10px] pb-[8px]"
              style={{ backgroundColor: hexToRgba(note.color, 0.22) }}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <svg className="w-3.5 h-3.5 shrink-0 text-slate-500" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M2.5 1.5h7l2 2v9a.5.5 0 01-.5.5h-8.5a.5.5 0 01-.5-.5v-10.5a.5.5 0 01.5-.5z" />
                  <path d="M9.5 1.5v2.5h2" />
                  <line x1="4" y1="6" x2="10" y2="6" />
                  <line x1="4" y1="8.5" x2="10" y2="8.5" />
                  <line x1="4" y1="11" x2="7" y2="11" />
                </svg>
                <span className="text-[12px] font-medium text-slate-600 truncate leading-none">
                  Pg: {String(note.pageNumber).padStart(2, '0')}
                  {documentName ? ` | ${documentName}` : ''}
                </span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                className="shrink-0 text-slate-500 hover:text-slate-700 text-base leading-none ml-2"
              >×</button>
            </div>

            {/* Body */}
            <div className="px-[10px]" style={{ backgroundColor: hexToRgba(note.color, 0.22) }}>
              {note.selectedText && (
                <p className="text-[13px] text-slate-500 leading-[1.55] p-[8px] rounded-[8px] line-clamp-3 bg-white">
                  {note.selectedText.slice(0, 150)}{note.selectedText.length > 150 ? '…' : ''}
                </p>
              )}
              {note.content && (
                <p className="text-[13px] font-medium text-slate-700 mt-[8px] leading-snug line-clamp-2">
                  {note.content}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-[10px] pb-[10px] pt-[8px]" style={{ backgroundColor: hexToRgba(note.color, 0.22) }}>
              <button
                onClick={(e) => { e.stopPropagation(); setSharingNoteId(note.id); }}
                title="Share as discussion"
                className="text-slate-400 hover:text-indigo-500 transition-colors"
              >
                <svg className="w-[15px] h-[15px]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
                  <path d="M1.5 2.5A1 1 0 012.5 1.5h11a1 1 0 011 1v7.5a1 1 0 01-1 1H9l-2.5 2.5v-2.5H2.5a1 1 0 01-1-1v-7.5z" />
                </svg>
              </button>
              <span className="text-[11px] text-slate-400">
                {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {sharingNote && (
        <ShareAsDiscussionModal
          noteId={sharingNote.id}
          selectedText={sharingNote.selectedText}
          currentUserId={userId}
          onClose={() => setSharingNoteId(null)}
          onShare={onShare}
        />
      )}
    </>
  );
}
