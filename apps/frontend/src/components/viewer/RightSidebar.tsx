'use client';
import { useState } from 'react';
import type { AnnotationDto } from '@prokoti/types';
import { AnnotationType } from '@prokoti/types';
import { NotesTab } from './NotesTab';
import { DiscussionsTab } from './DiscussionsTab';
import { SignaturesTab } from './SignaturesTab';

interface Props {
  annotations: AnnotationDto[];
  userId: string;
  selectedAnnotationId: string | null;
  onAnnotationSelect: (id: string | null) => void;
  onAnnotationUpdate: (id: string, dto: { content?: string; color?: string }) => Promise<AnnotationDto>;
  onAnnotationDelete: (id: string) => Promise<void>;
  onReply: (annotationId: string, content: string) => Promise<any>;
  onShare: (id: string, memberIds: string[]) => Promise<AnnotationDto>;
}

type Tab = 'notes' | 'discussions' | 'signatures';

export function RightSidebar({
  annotations, userId, selectedAnnotationId,
  onAnnotationSelect, onAnnotationUpdate, onAnnotationDelete, onReply, onShare,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('notes');

  const notes = annotations.filter(
    (a) => a.isPrivate && a.userId === userId && a.type !== AnnotationType.SIGNATURE,
  );
  const discussions = annotations.filter(
    (a) => !a.isPrivate && a.type === AnnotationType.DISCUSSION,
  );
  const signatures = annotations.filter((a) => a.type === AnnotationType.SIGNATURE);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'notes', label: 'Notes', count: notes.length },
    { id: 'discussions', label: 'Discussions', count: discussions.length },
    { id: 'signatures', label: 'Signatures', count: signatures.length },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1 text-xs bg-slate-100 text-slate-500 rounded-full px-1.5 py-0.5">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'notes' && (
          <NotesTab
            notes={notes}
            selectedAnnotationId={selectedAnnotationId}
            onSelect={onAnnotationSelect}
            onDelete={onAnnotationDelete}
          />
        )}
        {activeTab === 'discussions' && (
          <DiscussionsTab
            discussions={discussions}
            userId={userId}
            selectedAnnotationId={selectedAnnotationId}
            onSelect={onAnnotationSelect}
            onReply={onReply}
            onShare={onShare}
          />
        )}
        {activeTab === 'signatures' && (
          <SignaturesTab
            signatures={signatures}
            onSelect={onAnnotationSelect}
            onDelete={onAnnotationDelete}
          />
        )}
      </div>
    </div>
  );
}
