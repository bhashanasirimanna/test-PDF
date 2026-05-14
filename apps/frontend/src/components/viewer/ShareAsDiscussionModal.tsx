'use client';
import { useState, useEffect } from 'react';
import type { UserDto } from '@prokoti/types';
import { api } from '@/lib/api';
import { Avatar } from '@/components/ui/Avatar';

interface Props {
  noteId: string;
  selectedText?: string;
  currentUserId: string;
  onClose: () => void;
  onShare: (noteId: string, memberIds: string[]) => Promise<void>;
}

export function ShareAsDiscussionModal({ noteId, selectedText, currentUserId, onClose, onShare }: Props) {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<UserDto[]>('/users')
      .then((all) => setUsers(all.filter((u) => u.id !== currentUserId)))
      .catch(console.error);
  }, [currentUserId]);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  function toggleUser(id: string) {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  async function handleShare() {
    if (selectedIds.length === 0) return;
    setSaving(true);
    try {
      await onShare(noteId, selectedIds);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-[360px] p-5">
        <h3 className="font-semibold text-slate-900 mb-0.5">Share as Discussion</h3>
        <p className="text-xs text-slate-400 mb-3">This note will become a shared discussion</p>

        {selectedText && (
          <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-2.5 mb-4 line-clamp-2 italic">
            "{selectedText.slice(0, 120)}{selectedText.length > 120 ? '…' : ''}"
          </p>
        )}

        <label className="block text-xs font-medium text-slate-600 mb-1.5">Add members</label>
        <input
          type="text"
          className="input text-sm mb-2"
          placeholder="Search users…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />

        <div className="max-h-40 overflow-y-auto space-y-0.5 mb-3">
          {filtered.length === 0 && (
            <p className="text-xs text-slate-400 py-2 text-center">No users found</p>
          )}
          {filtered.map((u) => (
            <label
              key={u.id}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(u.id)}
                onChange={() => toggleUser(u.id)}
                className="rounded"
              />
              <Avatar name={u.name} url={u.avatarUrl} size={24} />
              <div>
                <div className="text-xs font-medium text-slate-800">{u.name}</div>
                <div className="text-[11px] text-slate-400">{u.email}</div>
              </div>
            </label>
          ))}
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
                  <button onClick={() => toggleUser(id)} className="hover:text-indigo-900 leading-none">×</button>
                </span>
              );
            })}
          </div>
        )}

        <div className="flex gap-2 justify-end pt-1">
          <button onClick={onClose} className="btn-secondary text-sm py-1.5">Cancel</button>
          <button
            onClick={handleShare}
            disabled={selectedIds.length === 0 || saving}
            className="btn-primary text-sm py-1.5"
          >
            {saving ? 'Sharing…' : 'Share'}
          </button>
        </div>
      </div>
    </div>
  );
}
