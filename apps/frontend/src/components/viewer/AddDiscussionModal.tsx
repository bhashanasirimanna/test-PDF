'use client';
import { useState, useEffect } from 'react';
import { AnnotationType } from '@prokoti/types';
import type { CreateAnnotationDto, UserDto } from '@prokoti/types';
import { ANNOTATION_COLORS } from '@/lib/colors';
import { api } from '@/lib/api';
import { Avatar } from '@/components/ui/Avatar';

interface Props {
  selection: { rects: any[]; selectedText: string; pageNumber: number };
  onClose: () => void;
  onSave: (dto: CreateAnnotationDto) => Promise<void>;
}

export function AddDiscussionModal({ selection, onClose, onSave }: Props) {
  const [color, setColor] = useState('#4CAF50');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get<UserDto[]>('/users').then(setUsers).catch(console.error);
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  function toggleUser(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);
    await onSave({
      documentId: '',
      type: AnnotationType.DISCUSSION,
      pageNumber: selection.pageNumber,
      rects: selection.rects,
      selectedText: selection.selectedText,
      color,
      content,
      isPrivate: false,
      memberIds: selectedIds,
    } as any);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in" data-modal>
      <div className="bg-white rounded-xl shadow-2xl w-96 p-5 max-h-[90vh] overflow-y-auto">
        <h3 className="font-semibold text-slate-900 mb-2">Start Discussion</h3>
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
          className="input h-20 resize-none mb-3"
          placeholder="Start the discussion..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          autoFocus
        />

        <div className="mb-3">
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Add members</label>
          <input
            type="text"
            className="input text-sm mb-2"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="max-h-36 overflow-y-auto space-y-1">
            {filtered.map((u) => (
              <label key={u.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(u.id)}
                  onChange={() => toggleUser(u.id)}
                  className="rounded"
                />
                <Avatar name={u.name} url={u.avatarUrl} size={24} />
                <div>
                  <div className="text-xs font-medium text-slate-800">{u.name}</div>
                  <div className="text-xs text-slate-400">{u.email}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {selectedIds.map((id) => {
              const u = users.find((x) => x.id === id);
              if (!u) return null;
              return (
                <span
                  key={id}
                  className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 rounded-full px-2 py-0.5"
                >
                  {u.name}
                  <button onClick={() => toggleUser(id)} className="hover:text-indigo-900">×</button>
                </span>
              );
            })}
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="btn-secondary text-sm py-1.5">Cancel</button>
          <button onClick={handleSave} disabled={!content.trim() || saving} className="btn-primary text-sm py-1.5">
            {saving ? 'Saving...' : 'Start Discussion'}
          </button>
        </div>
      </div>
    </div>
  );
}
