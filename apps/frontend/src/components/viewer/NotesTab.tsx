"use client";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  GripVertical,
  FileSymlink,
  Pencil,
  Trash2,
  Link2,
  MessageSquare,
  Link,
} from "lucide-react";
import type { AnnotationDto } from "@prokoti/types";
import { ShareAsDiscussionModal } from "./ShareAsDiscussionModal";

interface Props {
  notes: AnnotationDto[];
  selectedAnnotationId: string | null;
  userId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onShare: (id: string, memberIds: string[]) => Promise<any>;
  documentName?: string;
}

export function NotesTab({
  notes,
  selectedAnnotationId,
  userId,
  onSelect,
  onDelete,
  onShare,
}: Props) {
  const [sharingNoteId, setSharingNoteId] = useState<string | null>(null);

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="text-3xl mb-2">📝</div>
        <p className="text-sm font-medium text-slate-600">No notes yet</p>
        <p className="text-xs text-slate-400 mt-1">
          Select text in the document and click the note icon
        </p>
      </div>
    );
  }

  const sharingNote = sharingNoteId
    ? notes.find((n) => n.id === sharingNoteId)
    : null;

  return (
    <>
      <div className=" px-[20px] pb-[16px] space-y-[16px]">
        {notes.map((note) => (
          <div
            key={note.id}
            onClick={() => onSelect(note.id)}
            className={`relative rounded-[2px] px-[16px] pt-[16px] pb-[8px] bg-white overflow-hidden cursor-pointer transition-shadow ${
              selectedAnnotationId === note.id
                ? "shadow-[0_0_0_2px_#693b89]"
                : "shadow-[0_1px_4px_rgba(71,85,105,0.28),0_1px_3px_rgba(100,116,139,0.16)]"
            }`}
          >
            {/* Left color accent strip */}
            <div
              className="absolute left-0 top-0 bottom-0 w-[3px]"
              style={{ backgroundColor: note.color }}
            />

            <div className="">
              {/* Header */}
              <div className="flex items-center justify-between mb-[16px]">
                <div className="flex items-center gap-[10px] min-w-0 text-[#64748B]">
                  <GripVertical className="w-[12px] h-[12px] shrink-0" />
                  <div className=" flex justify-start items-center text-[12px] leading-[16px] truncate">
                    <FileSymlink className="w-[12px] h-[12px] shrink-0 mr-[4px]" />
                    Pg: {String(note.pageNumber).padStart(2, "0")}
                  </div>
                </div>
                <div className="flex items-center gap-[14px] shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(note.id);
                    }}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                    title="Edit note"
                  >
                    <Pencil className="w-[14px] h-[14px]" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(note.id);
                    }}
                    className="text-slate-400 hover:text-rose-500 transition-colors"
                    title="Delete note"
                  >
                    <Trash2 className="w-[14px] h-[14px]" />
                  </button>
                </div>
              </div>

              {/* Highlighted quote */}
              {note.selectedText && (
                <p className="text-[14px] px-[4px] py-[6px] leading-[20px] text-[#404040] mb-[4px]">
                  <span className="bg-[#fef9c3] box-decoration-clone py-0.5 pr-1">
                    <Link className="inline w-[14px] h-[14px] mr-[10px] text-[#404040]" />
                    {note.selectedText.slice(0, 150)}
                    {note.selectedText.length > 150 ? "…" : ""}
                  </span>
                </p>
              )}

              {/* Note body */}
              {note.content && (
                <p className="text-[14px] leading-[20px] italic text-[#171717] line-clamp-3 pb-[12px]">
                  {note.content}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-[#F5F5F5] pr-[8px] pt-[12px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSharingNoteId(note.id);
                }}
                title="Share as discussion"
                className="flex items-center gap-[8px] h-[24px] px-[8px] py-[3px] rounded-[8px] bg-[#F1F5F9] hover:bg-slate-200 text-[12px] leading-[16px] font-medium text-[#0F172A] transition-colors"
              >
                <MessageSquare className="w-[12px] h-[12px]" />
                Open Discussion
              </button>
              <span className="text-[12px] text-slate-500/[0.73]">
                {formatDistanceToNow(new Date(note.createdAt), {
                  addSuffix: true,
                })}
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
