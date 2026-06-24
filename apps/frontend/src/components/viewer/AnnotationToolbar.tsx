"use client";
import { useState, useEffect, useRef } from "react";
import { AnnotationType } from "@prokoti/types";
import type { CreateAnnotationDto } from "@prokoti/types";
import { AddNoteModal } from "./AddNoteModal";
import { AddDiscussionModal } from "./AddDiscussionModal";
import Image from "next/image";
import { MessagesSquare, StickyNote } from "lucide-react";

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

export function AnnotationToolbar({
  selection,
  onClose,
  onAnnotationCreate,
}: Props) {
  const [mode, setMode] = useState<"note" | "discussion" | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    function handleClick(e: MouseEvent) {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(e.target as Node)
      ) {
        if (!document.querySelector("[data-modal]")) onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [onClose]);

  async function handleHighlight() {
    await onAnnotationCreate({
      documentId: "",
      type: AnnotationType.HIGHLIGHT,
      pageNumber: selection.pageNumber,
      rects: selection.rects,
      selectedText: selection.selectedText,
      color: "#FFD700",
      content: "",
      isPrivate: true,
    } as any);
    onClose();
  }

  async function handleUnderline() {
    await onAnnotationCreate({
      documentId: "",
      type: AnnotationType.UNDERLINE,
      pageNumber: selection.pageNumber,
      rects: selection.rects,
      selectedText: selection.selectedText,
      color: "#FFD700",
      content: "",
      isPrivate: true,
    } as any);
    onClose();
  }

  const style = {
    position: "fixed" as const,
    top: selection.screenY - 60,
    left: selection.screenX - 80,
    zIndex: 1000,
  };

  if (mode === "note") {
    return (
      <AddNoteModal
        selection={selection}
        onClose={onClose}
        onSave={async (dto) => {
          await onAnnotationCreate(dto);
          onClose();
        }}
      />
    );
  }

  if (mode === "discussion") {
    return (
      <AddDiscussionModal
        selection={selection}
        onClose={onClose}
        onSave={async (dto) => {
          await onAnnotationCreate(dto);
          onClose();
        }}
      />
    );
  }

  return (
    <div
      ref={toolbarRef}
      style={{ ...style, boxShadow: "0px 1px 7.4px rgba(0,0,0,0.15)" }}
      className="bg-[#000000] flex items-center gap-[8px] p-[8px] rounded-tr-[8px] rounded-b-[8px] animate-fade-in"
    >
      <button
        onClick={() => setMode("note")}
        className="flex items-center gap-[6px] px-[12px] py-[6px] min-h-[32px] rounded-[8px] bg-white/[0.08] hover:bg-white/[0.16] text-[#FAFAFA] text-[14px] leading-[20px] font-medium transition-colors"
        title="Add note"
      >
        <StickyNote className="w-[16px] h-[16px]" />
        Add Note
      </button>
      {/* <button
        onClick={() => setMode("discussion")}
        className="flex items-center gap-[6px] px-[12px] py-[6px] min-h-[32px] rounded-[8px] bg-white/[0.08] hover:bg-white/[0.16] text-[#FAFAFA] text-[14px] leading-[20px] font-medium transition-colors"
        title="Start discussion"
      >
        <MessagesSquare className="w-[16px] h-[16px]" />
        Discuss
      </button> */}
      <button
        onClick={() => alert("CoSec AI not implemented yet")}
        className="flex items-center gap-[6px] px-[12px] py-[6px] min-h-[32px] rounded-[8px] bg-white/[0.08] hover:bg-white/[0.16] text-[#FAFAFA] text-[14px] leading-[20px] font-medium transition-colors"
        title="CoSec AI"
      >
        <Image
          src="/icons/gradientSparkling.svg"
          alt="Ask CoSec AI"
          width={16}
          height={16}
          className=" w-[16px] h-[16px]"
        />{" "}
        Ask CoSec AI
      </button>
      {/* <button
        onClick={handleUnderline}
        className="flex items-center justify-center w-8 min-h-[32px] rounded-lg bg-white/[0.08] hover:bg-white/[0.16] text-amber-400 text-[14px] font-medium underline transition-colors"
        title="Underline"
      >U</button> */}
    </div>
  );
}
