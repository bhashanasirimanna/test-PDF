'use client';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { AnnotationDto } from '@prokoti/types';
import { Avatar } from '@/components/ui/Avatar';

interface Props {
  discussions: AnnotationDto[];
  userId: string;
  selectedAnnotationId: string | null;
  onSelect: (id: string) => void;
  onReply: (annotationId: string, content: string) => Promise<any>;
  onShare: (id: string, memberIds: string[]) => Promise<AnnotationDto>;
}

export function DiscussionsTab({ discussions, userId, selectedAnnotationId, onSelect, onReply, onShare }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<string | null>(null);

  async function handleReply(annotationId: string) {
    const content = replyContent[annotationId]?.trim();
    if (!content) return;
    setSending(annotationId);
    await onReply(annotationId, content);
    setReplyContent((prev) => ({ ...prev, [annotationId]: '' }));
    setSending(null);
  }

  if (discussions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="text-3xl mb-2">💬</div>
        <p className="text-sm font-medium text-slate-600">No discussions yet</p>
        <p className="text-xs text-slate-400 mt-1">Select text and start a discussion with team members</p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-2">
      {discussions.map((d) => (
        <div
          key={d.id}
          className={`rounded-lg border cursor-pointer transition-all ${
            selectedAnnotationId === d.id || expanded === d.id
              ? 'border-indigo-300 bg-indigo-50'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div
            className="p-3"
            onClick={() => {
              onSelect(d.id);
              setExpanded((prev) => (prev === d.id ? null : d.id));
            }}
          >
            {d.selectedText && (
              <p className="text-xs italic text-slate-500 line-clamp-1 mb-1.5">
                "{d.selectedText.slice(0, 60)}..."
              </p>
            )}
            <p className="text-xs text-slate-700 line-clamp-2">{d.content}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex -space-x-1">
                {d.members?.slice(0, 3).map((m) => (
                  <Avatar key={m.id} name={m.name} url={m.avatarUrl} size={18} />
                ))}
              </div>
              <span className="text-xs text-slate-400">
                {(d.replies?.length || 0)} replies · p.{d.pageNumber}
              </span>
              <span className="text-xs text-slate-400 ml-auto">
                {formatDistanceToNow(new Date(d.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>

          {/* Expanded replies */}
          {expanded === d.id && (
            <div className="border-t border-slate-200 px-3 pb-3 pt-2">
              {/* Initial message */}
              <div className="flex gap-2 mb-2">
                <Avatar name={d.user?.name || ''} url={d.user?.avatarUrl} size={20} />
                <div>
                  <span className="text-xs font-medium text-slate-700">{d.user?.name}</span>
                  <p className="text-xs text-slate-600">{d.content}</p>
                </div>
              </div>

              {d.replies?.map((r) => (
                <div key={r.id} className="flex gap-2 mb-2 ml-2">
                  <Avatar name={r.user?.name || ''} url={r.user?.avatarUrl} size={18} />
                  <div>
                    <span className="text-xs font-medium text-slate-700">{r.user?.name}</span>
                    <p className="text-xs text-slate-600">{r.content}</p>
                    <p className="text-xs text-slate-400">
                      {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}

              <div className="flex gap-1.5 mt-2">
                <input
                  type="text"
                  className="input flex-1 text-xs py-1"
                  placeholder="Reply..."
                  value={replyContent[d.id] || ''}
                  onChange={(e) => setReplyContent((prev) => ({ ...prev, [d.id]: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleReply(d.id); }}
                />
                <button
                  onClick={() => handleReply(d.id)}
                  disabled={!replyContent[d.id]?.trim() || sending === d.id}
                  className="btn-primary text-xs py-1 px-2"
                >
                  {sending === d.id ? '...' : 'Send'}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
