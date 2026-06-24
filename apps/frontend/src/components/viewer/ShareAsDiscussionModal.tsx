"use client";
import { useState, useEffect } from "react";
import type { UserDto } from "@prokoti/types";
import { api } from "@/lib/api";
import { Avatar } from "@/components/ui/Avatar";
import { Search, Users, X, Check, StickyNote } from "lucide-react";

interface Props {
  noteId: string;
  selectedText?: string;
  currentUserId: string;
  onClose: () => void;
  onShare: (noteId: string, memberIds: string[]) => Promise<void>;
}

const TABS = ["Board", "Audit Comm.."];

export function ShareAsDiscussionModal({
  noteId,
  selectedText,
  currentUserId,
  onClose,
  onShare,
}: Props) {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(TABS[0]);

  useEffect(() => {
    api
      .get<UserDto[]>("/users")
      .then((all) => setUsers(all.filter((u) => u.id !== currentUserId)))
      .catch(console.error);
  }, [currentUserId]);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const allSelected =
    filtered.length > 0 && filtered.every((u) => selectedIds.includes(u.id));

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
      className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in"
      style={{
        backgroundColor: "rgba(0,0,0,0.44)",
        backdropFilter: "blur(4.35px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex flex-col items-center gap-[10px] bg-white border border-[#D8D8D8] rounded-[8px] shadow-md py-[12px] w-[502px] max-w-[502px] max-h-[682px] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-[20px] pb-[12px] border-b border-[#F5F5F5] w-full">
          <h3 className="text-[18px] font-medium text-black tracking-[-0.18px]">
            Share as Discussion
          </h3>
          <button
            onClick={onClose}
            className="flex items-center justify-center size-[30px] rounded-full text-black hover:bg-black/5"
            title="Close"
          >
            <X className="size-[11.05px]" strokeWidth={1.8} />
          </button>
        </div>

        <div className="flex flex-col items-start gap-[16px] w-full">
          {/* Section 1 — quoted note */}
          {selectedText && (
            <div className="flex flex-col items-start gap-[24px] px-[20px] pb-[24px] w-full border-b border-[#F5F5F5]">
              <div className="flex flex-col items-start gap-[4px] p-[12px] w-full rounded-[8px] bg-[#caeafc] overflow-hidden">
                <div className="flex items-center gap-[6px]">
                  <StickyNote
                    className="size-[12px] text-[#64748b]"
                    strokeWidth={1.5}
                  />
                  <span className="text-[12px] text-[#64748B] tracking-[-0.24px]">
                    Page: 01
                  </span>
                </div>
                <p className="text-[14px] leading-[20px] text-[#262626]">
                  “ {selectedText.slice(0, 200)}
                  {selectedText.length > 200 ? "…" : ""} “
                </p>
              </div>
              <input
                type="text"
                className="w-full px-[12px] py-[8px] rounded-full border border-[#94A3B8] text-[12px] leading-[20px] text-black placeholder:text-[#A3A3A3] focus:outline-none"
                placeholder="Discussion Title.."
              />
            </div>
          )}

          {/* Section 2 — discuss with */}
          <div className="flex flex-col items-start gap-[16px] w-full">
            <div className="flex flex-col items-center pb-[24px] px-[20px] w-full border-b border-[rgba(0,0,0,0.12)]">
              <div className="flex flex-col items-start gap-[20px] w-full">
                {/* Label + search */}
                <div className="flex flex-col items-start gap-[4px] w-full">
                  <div className="flex items-start justify-between w-full">
                    <span className="text-[16px] text-black">
                      Discuss with:
                    </span>
                    <div className="flex items-center gap-[6px]">
                      <Users
                        className="size-[20px] text-black"
                        strokeWidth={1.5}
                      />
                      <span className="text-[14px] text-black">
                        {String(selectedIds.length).padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-[6px] min-h-[32px] w-full px-[8px] py-[5.5px] rounded-[8px] border border-[#e2e8f0] bg-white">
                    <Search
                      className="size-[16px] text-[#94a3b8]"
                      strokeWidth={1.5}
                    />
                    <input
                      type="text"
                      className="flex-1 bg-transparent text-[14px] leading-[20px] text-black placeholder:text-[#94a3b8] focus:outline-none"
                      placeholder="Search member"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>

                {/* List block */}
                <div className="flex flex-col items-start gap-[16px] w-full">
                  {/* Every One */}
                  <div className="flex items-center justify-between pb-[16px] w-full border-b border-[#e2e8f0]">
                    <div className="flex items-center gap-[10px]">
                      <div className="flex items-center justify-center size-[26px] rounded-full bg-[#e2d4ed]">
                        <span className="text-[14px] font-medium text-[#693b89] leading-none">
                          #
                        </span>
                      </div>
                      <div className="flex flex-col gap-[2px]">
                        <p className="text-[14px] font-medium text-black">
                          Every One
                        </p>
                        <p className="text-[12px] text-[#777]">
                          Join everyone in this meeting.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={toggleAll}
                      className={`flex items-center justify-center size-[20px] rounded-[4px] border-[0.833px] ${
                        allSelected
                          ? "bg-[#551b8c] border-[#551b8c]"
                          : "bg-white border-[#d4d4d4]"
                      }`}
                      style={{
                        boxShadow: "0px 2.5px 2.583px rgba(0,0,0,0.06)",
                      }}
                      title="Select everyone"
                    >
                      {allSelected && (
                        <Check
                          className="size-[13.33px] text-white"
                          strokeWidth={2.5}
                        />
                      )}
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
                                ? "bg-[#020617] border-[#020617] text-[#f8fafc]"
                                : "bg-transparent border-[rgba(0,0,0,0.2)] text-[#737373]"
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
                          <span className="text-[12px] text-[#737373]">
                            Select all
                          </span>
                          <button
                            onClick={toggleAll}
                            className={`flex items-center justify-center size-[20px] rounded-[4px] border-[0.833px] ${
                              allSelected
                                ? "bg-[#551b8c] border-[#551b8c]"
                                : "bg-white border-[#d4d4d4]"
                            }`}
                            style={{
                              boxShadow: "0px 2.5px 2.583px rgba(0,0,0,0.06)",
                            }}
                            title="Select all"
                          >
                            {allSelected && (
                              <Check
                                className="size-[13.33px] text-white"
                                strokeWidth={2.5}
                              />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Rows */}
                      <div className="flex flex-col items-start gap-[8px] w-full max-h-[130px] overflow-y-auto">
                        {filtered.length === 0 && (
                          <p className="text-[12px] text-[#94a3b8] py-[8px] w-full text-center">
                            No users found
                          </p>
                        )}
                        {filtered.map((u) => {
                          const checked = selectedIds.includes(u.id);
                          return (
                            <div
                              key={u.id}
                              className="flex items-center justify-between w-full"
                            >
                              <div className="flex items-center gap-[10px]">
                                <Avatar
                                  name={u.name}
                                  url={u.avatarUrl}
                                  size={26}
                                />
                                <span className="text-[14px] text-[#404040]">
                                  {u.name}
                                </span>
                              </div>
                              <button
                                onClick={() => toggleUser(u.id)}
                                className={`flex items-center justify-center size-[20px] rounded-[4px] border-[0.833px] ${
                                  checked
                                    ? "bg-[#551b8c] border-[#551b8c]"
                                    : "bg-white border-[#d4d4d4]"
                                }`}
                                style={{
                                  boxShadow:
                                    "0px 2.5px 2.583px rgba(0,0,0,0.06)",
                                }}
                                title={checked ? "Remove" : "Add"}
                              >
                                {checked && (
                                  <Check
                                    className="size-[13.33px] text-white"
                                    strokeWidth={2.5}
                                  />
                                )}
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
                  onClick={handleShare}
                  disabled={selectedIds.length === 0 || saving}
                  className="flex items-center justify-center min-h-[32px] px-[12px] py-[6px] rounded-[8px] bg-[#551b8c] text-[14px] leading-[20px] font-medium text-[#fafafa] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Sharing…" : "Open Discussion"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
