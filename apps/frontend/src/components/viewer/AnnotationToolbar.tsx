'use client';
import { useState, useEffect, useRef } from 'react';
import { AnnotationType } from '@prokoti/types';
import type { CreateAnnotationDto } from '@prokoti/types';
import { AddNoteModal } from './AddNoteModal';
import { AddDiscussionModal } from './AddDiscussionModal';

interface SelectionInfo {
  rects: Array<{ x: number; y: number; w: number; h: number }>;
  selectedText: string;
  pageNumber: number;
  screenX: number;
  screenY: number;
}

interface Props {
  selection: SelectionInfo;
  onClose: () => void;
  onAnnotationCreate: (dto: CreateAnnotationDto) => Promise<void>;
}

export function AnnotationToolbar({ selection, onClose, onAnnotationCreate }: Props) {
  const [mode, setMode] = useState<'note' | 'discussion' | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    function handleClick(e: MouseEvent) {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        if (!document.querySelector('[data-modal]')) onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [onClose]);

  async function handleHighlight() {
    await onAnnotationCreate({
      documentId: '',
      type: AnnotationType.HIGHLIGHT,
      pageNumber: selection.pageNumber,
      rects: selection.rects,
      selectedText: selection.selectedText,
      color: '#FFD700',
      content: '',
      isPrivate: true,
    } as any);
    onClose();
  }

  async function handleUnderline() {
    await onAnnotationCreate({
      documentId: '',
      type: AnnotationType.UNDERLINE,
      pageNumber: selection.pageNumber,
      rects: selection.rects,
      selectedText: selection.selectedText,
      color: '#FFD700',
      content: '',
      isPrivate: true,
    } as any);
    onClose();
  }

  const style = {
    position: 'fixed' as const,
    top: selection.screenY - 60,
    left: selection.screenX - 80,
    zIndex: 1000,
  };

  if (mode === 'note') {
    return (
      <AddNoteModal
        selection={selection}
        onClose={onClose}
        onSave={async (dto) => { await onAnnotationCreate(dto); onClose(); }}
      />
    );
  }

  if (mode === 'discussion') {
    return (
      <AddDiscussionModal
        selection={selection}
        onClose={onClose}
        onSave={async (dto) => { await onAnnotationCreate(dto); onClose(); }}
      />
    );
  }

  return (
    <div
      ref={toolbarRef}
      style={style}
      className="bg-slate-800 rounded-lg shadow-xl flex items-center gap-1 p-1 animate-fade-in"
    >
      <button
        onClick={() => setMode('note')}
        className="p-2 rounded hover:bg-slate-700 text-white text-sm"
        title="Add note"
      >📝</button>
      <button
        onClick={() => setMode('discussion')}
        className="p-2 rounded hover:bg-slate-700 text-white text-sm"
        title="Start discussion"
      >💬</button>
      {/* <button
        onClick={handleHighlight}
        className="p-2 rounded hover:bg-slate-700 text-white text-sm"
        title="Highlight"
      >🖊</button> */}
      <button
        onClick={() => alert('Cosec AI not implemented yet')}
        className="p-2 rounded hover:bg-slate-700 text-white text-sm"
        title="Cosec AI"
      >✨</button>
      <button
        onClick={handleUnderline}
        className="p-2 rounded hover:bg-slate-700 text-amber-400 text-sm underline"
        title="Underline"
      >U</button>
    </div>
  );
}
