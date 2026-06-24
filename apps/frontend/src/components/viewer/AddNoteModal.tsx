"use client";
import { useState } from "react";
import { AnnotationType } from "@prokoti/types";
import type { CreateAnnotationDto } from "@prokoti/types";
import { ANNOTATION_COLORS } from "@/lib/colors";
import { StickyNoteMinus, X } from "lucide-react";

interface Props {
  selection: { rects: any[]; selectedText: string; pageNumber: number };
  onClose: () => void;
  onSave: (dto: CreateAnnotationDto) => Promise<void>;
}

export function AddNoteModal({ selection, onClose, onSave }: Props) {
  const [color, setColor] = useState("#FFD700");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!content.trim()) return;
    setSaving(true);
    await onSave({
      documentId: "",
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
    <div
      className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in"
      style={{
        backgroundColor: "rgba(0,0,0,0.44)",
        backdropFilter: "blur(4.35px)",
      }}
      data-modal
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-[357px] overflow-hidden"
        style={{ border: "1px solid #e0e0e0" }}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between bg-[#F1F5F9] pl-[20px] pr-[8px] py-[8px]">
          <h3 className="text-[16px] text-black">Note</h3>
          <button
            onClick={onClose}
            className="w-[24px] h-[24px] rounded-full flex items-center justify-center text-neutral-700 hover:bg-black/5"
            title="Close"
          >
            <X className="w-[11.05px] h-[11.05px]" />
          </button>
        </div>

        {/* Body */}
        <div className="px-[20px] py-[16px]">
          {selection.selectedText && (
            <div className="flex items-end justify-between gap-[16px] mb-[16px] px-[2px]">
              <p className="flex-1 text-[14px] text-[#404040] leading-[20px]">
                <span className="bg-[#FEF9C3] box-decoration-clone px-0.5">
                  {selection.selectedText.slice(0, 120)}
                  {selection.selectedText.length > 120 ? "…" : ""}
                </span>
              </p>
              <span className="flex items-center gap-[4px] shrink-0 text-[12px] text-[#A3A3A3]">
                <StickyNoteMinus className="w-[12px] h-[12px]" />
                Pg: {String(selection.pageNumber).padStart(2, "0")}
              </span>
            </div>
          )}

          <div className="flex gap-[12px] mb-[16px]">
            {ANNOTATION_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                className="w-[28px] h-[28px] rounded-full border-[2px] transition-transform hover:scale-110"
                style={{
                  backgroundColor: c.value,
                  borderColor: color === c.value ? "#693b89" : "transparent",
                }}
                title={c.label}
              />
            ))}
          </div>

          <textarea
            className="w-full h-20 resize-none rounded-[8px] px-[8px] py-[8px] text-[14px] text-neutral-900 placeholder:text-[#717171] focus:outline-none focus:ring-2 focus:ring-brand-purple/40 mb-[36px]"
            style={{ border: "0.75px solid #94a3b8" }}
            placeholder="Your note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
          />

          <div className="flex gap-[12px] justify-end">
            <button
              onClick={onClose}
              className="text-[14px] leading-[20px] text-neutral-950 hover:bg-slate-50 px-[12px] py-[6px] rounded-[8px] min-h-[32px]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!content.trim() || saving}
              className="text-[14px] leading-[20px] text-neutral-50 bg-brand-primary hover:bg-brand-primary-hover px-[12px] py-[6px] min-h-[32px] rounded-[8px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Add Note"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
