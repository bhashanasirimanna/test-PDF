'use client';
import { useState } from 'react';
import { AnnotationType } from '@prokoti/types';
import type { CreateAnnotationDto } from '@prokoti/types';
import { ANNOTATION_COLORS } from '@/lib/colors';

interface Props {
  selection: { rects: any[]; selectedText: string; pageNumber: number };
  onClose: () => void;
  onSave: (dto: CreateAnnotationDto) => Promise<void>;
}

export function AddNoteModal({ selection, onClose, onSave }: Props) {
  const [color, setColor] = useState('#FFD700');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);
    await onSave({
      documentId: '',
      type: AnnotationType.NOTE,
      pageNumber: selection.pageNumber,
      rects: selection.rects,
      selectedText: selection.selectedText,
      color,
      content,
      isPrivate: true,
    } as any);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in" data-modal>
      <div className="bg-white rounded-xl shadow-2xl w-80 p-5">
        <h3 className="font-semibold text-slate-900 mb-2">Add Note</h3>
        {selection.selectedText && (
          <p className="text-xs text-slate-500 bg-slate-50 rounded p-2 mb-3 line-clamp-2 italic">
            "{selection.selectedText.slice(0, 120)}{selection.selectedText.length > 120 ? '…' : ''}"
          </p>
        )}

        <div className="flex gap-2 mb-3">
          {ANNOTATION_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => setColor(c.value)}
              className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                backgroundColor: c.value,
                borderColor: color === c.value ? '#1e293b' : 'transparent',
              }}
              title={c.label}
            />
          ))}
        </div>

        <textarea
          className="input h-24 resize-none mb-3"
          placeholder="Write your note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          autoFocus
        />

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="btn-secondary text-sm py-1.5">Cancel</button>
          <button onClick={handleSave} disabled={!content.trim() || saving} className="btn-primary text-sm py-1.5">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
