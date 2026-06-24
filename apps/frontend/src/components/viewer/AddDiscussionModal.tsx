'use client';
import { useState, useEffect } from 'react';
import { AnnotationType } from '@prokoti/types';
import type { CreateAnnotationDto, UserDto } from '@prokoti/types';
import { api } from '@/lib/api';
import { Avatar } from '@/components/ui/Avatar';
import { Search, Users, X, Check, StickyNote } from 'lucide-react';

interface Props {
  selection: { rects: any[]; selectedText: string; pageNumber: number };
  onClose: () => void;
  onSave: (dto: CreateAnnotationDto) => Promise<void>;
}

const TABS = ['Board', 'Audit Comm..'];

export function AddDiscussionModal({ selection, onClose, onSave }: Props) {
  const [color] = useState('#4CAF50');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState(TABS[0]);

  useEffect(() => {
    api.get<UserDto[]>('/users').then(setUsers).catch(console.error);
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const allSelected = filtered.length > 0 && filtered.every((u) => selectedIds.includes(u.id));

  function toggleUser(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleAll() {
    setSelectedIds((prev) => {
      if (allSelected) {
        const ids = new Set(filtered.map((u) => u.id));
        return prev.filter((x) => !ids.has(x));
      }
      const merged = new Set(prev);
      filtered.forEach((u) => merged.add(u.id));
      return Array.from(merged);
    });
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
    <div
      className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in"
      style={{ backgroundColor: 'rgba(0,0,0,0.44)', backdropFilter: 'blur(4.35px)' }}
      data-modal
    >
      <div className="flex flex-col items-center gap-[10px] bg-white border border-[#D8D8D8] rounded-[8px] shadow-md py-[12px] w-[502px] max-w-[94vw] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col items-center gap-[10px] w-full">
          <div className="flex items-center justify-between px-[20px] w-full">
            <h3 className="text-[18px] font-medium text-black tracking-[-0.18px]">Open Discussion</h3>
            <button
              onClick={onClose}
              className="flex items-center justify-center size-[30px] rounded-full text-black hover:bg-black/5"
              title="Close"
            >
              <X className="size-[12px]" strokeWidth={1.8} />
            </button>
          </div>
          <div className="h-px w-full bg-[#e2e8f0]" />
        </div>

        <div className="flex flex-col items-start gap-[16px] w-full">
          {/* Section 1 — quote + discussion title */}
          <div className="flex flex-col items-center pb-[24px] w-full border-b border-[rgba(0,0,0,0.12)]">
            <div className="flex flex-col items-start gap-[24px] px-[20px] w-full">
              {/* Quoted selected text */}
              <div className="flex flex-col items-start gap-[4px] p-[12px] w-full rounded-[8px] bg-[#caeafc] overflow-hidden">
                <div className="flex items-center gap-[6px]">
                  <StickyNote className="size-[12px] text-[#64748b]" strokeWidth={1.5} />
                  <span className="text-[12px] text-[#64748b] tracking-[-0.24px]">
                    Page: {String(selection.pageNumber).padStart(2, '0')}
                  </span>
                </div>
                <p className="text-[14px] leading-[20px] text-[#262626]">
                  “ {selection.selectedText.slice(0, 200)}{selection.selectedText.length > 200 ? '…' : ''} “
                </p>
              </div>

              {/* Discussion title input */}
              <div className="flex flex-col justify-center h-[40px] w-full pl-[12px] pr-[8px] py-[8px] rounded-[100px] border-[0.75px] border-[#94a3b8]">
                <input
                  type="text"
                  className="w-full bg-transparent text-[14px] leading-[20px] text-black placeholder:text-[#a3a3a3] placeholder:font-light focus:outline-none"
                  placeholder="Discussion Title.."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          </div>

          {/* Section 2 — discuss with */}
          <div className="flex flex-col items-start gap-[16px] w-full">
            <div className="flex flex-col items-center pb-[24px] px-[20px] w-full border-b border-[rgba(0,0,0,0.12)]">
              <div className="flex flex-col items-start gap-[20px] w-full">
                {/* Label + search */}
                <div className="flex flex-col items-start gap-[4px] w-full">
                  <div className="flex items-start justify-between w-full">
                    <span className="text-[16px] text-black">Discuss with:</span>
                    <div className="flex items-center gap-[6px]">
                      <Users className="size-[20px] text-black" strokeWidth={1.5} />
                      <span className="text-[14px] text-black">{String(selectedIds.length).padStart(2, '0')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-[6px] min-h-[32px] w-full px-[8px] py-[5.5px] rounded-[8px] border border-[#e2e8f0] bg-white">
                    <Search className="size-[16px] text-[#94a3b8]" strokeWidth={1.5} />
                    <input
                      type="text"
                      className="flex-1 bg-transparent text-[14px] leading-[20px] text-black placeholder:text-[#94a3b8] focus:outline-none"
                      placeholder="Search member"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* List block */}
                <div className="flex flex-col items-start gap-[16px] w-full">
                  {/* Every One */}
                  <div className="flex items-center justify-between pb-[16px] w-full border-b border-[#e2e8f0]">
                    <div className="flex items-center gap-[10px]">
                      <div className="flex items-center justify-center size-[26px] rounded-full bg-[#e2d4ed]">
                        <span className="text-[14px] font-medium text-[#693b89] leading-none">#</span>
                      </div>
                      <div className="flex flex-col gap-[2px]">
                        <p className="text-[14px] font-medium text-black">Every One</p>
                        <p className="text-[12px] text-[#777]">Join everyone in this meeting.</p>
                      </div>
                    </div>
                    <button
                      onClick={toggleAll}
                      className={`flex items-center justify-center size-[20px] rounded-[4px] border-[0.833px] ${
                        allSelected ? 'bg-[#551b8c] border-[#551b8c]' : 'bg-white border-[#d4d4d4]'
                      }`}
                      style={{ boxShadow: '0px 2.5px 2.583px rgba(0,0,0,0.06)' }}
                      title="Select everyone"
                    >
                      {allSelected && <Check className="size-[13.33px] text-white" strokeWidth={2.5} />}
                    </button>
                  </div>

                  {/* Members */}
                  <div className="flex flex-col items-start gap-[8px] w-full">
                    {/* Tabs */}
                    <div className="flex items-center gap-[9px] w-full">
                      {TABS.map((tab) => {
                        const active = tab === activeTab;
                        return (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex items-center px-[9px] py-[8px] rounded-[100px] text-[12px] font-medium leading-none border-[0.75px] ${
                              active
                                ? 'bg-[#020617] border-[#020617] text-[#f8fafc]'
                                : 'bg-transparent border-[rgba(0,0,0,0.2)] text-[#737373]'
                            }`}
                          >
                            {tab}
                          </button>
                        );
                      })}
                    </div>

                    {/* Member list */}
                    <div className="flex flex-col items-start gap-[8px] w-full">
                      {/* Select all */}
                      <div className="flex items-center justify-end py-[2px] w-full">
                        <div className="flex items-center gap-[8px]">
                          <span className="text-[12px] text-[#737373]">Select all</span>
                          <button
                            onClick={toggleAll}
                            className={`flex items-center justify-center size-[20px] rounded-[4px] border-[0.833px] ${
                              allSelected ? 'bg-[#551b8c] border-[#551b8c]' : 'bg-white border-[#d4d4d4]'
                            }`}
                            style={{ boxShadow: '0px 2.5px 2.583px rgba(0,0,0,0.06)' }}
                            title="Select all"
                          >
                            {allSelected && <Check className="size-[13.33px] text-white" strokeWidth={2.5} />}
                          </button>
                        </div>
                      </div>

                      {/* Rows */}
                      <div className="flex flex-col items-start gap-[8px] w-full max-h-[160px] overflow-y-auto">
                        {filtered.map((u) => {
                          const checked = selectedIds.includes(u.id);
                          return (
                            <div key={u.id} className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-[10px]">
                                <Avatar name={u.name} url={u.avatarUrl} size={26} />
                                <span className="text-[14px] text-[#404040]">{u.name}</span>
                              </div>
                              <button
                                onClick={() => toggleUser(u.id)}
                                className={`flex items-center justify-center size-[20px] rounded-[4px] border-[0.833px] ${
                                  checked ? 'bg-[#551b8c] border-[#551b8c]' : 'bg-white border-[#d4d4d4]'
                                }`}
                                style={{ boxShadow: '0px 2.5px 2.583px rgba(0,0,0,0.06)' }}
                                title={checked ? 'Remove' : 'Add'}
                              >
                                {checked && <Check className="size-[13.33px] text-white" strokeWidth={2.5} />}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-[20px] w-full">
              <div className="flex items-center gap-[16px]">
                <button
                  onClick={onClose}
                  className="flex items-center justify-center min-h-[32px] px-[12px] py-[6px] rounded-[8px] border border-[#d4d4d4] bg-white text-[14px] leading-[20px] text-black"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!content.trim() || saving}
                  className="flex items-center justify-center min-h-[32px] px-[12px] py-[6px] rounded-[8px] bg-[#551b8c] text-[14px] leading-[20px] font-medium text-[#fafafa] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Open Discussion'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
