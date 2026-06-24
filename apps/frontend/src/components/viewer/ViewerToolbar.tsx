"use client";
import Link from "next/link";
import { FileText, MoveLeft, BookOpen, Clock, BookOpenText, Menu } from "lucide-react";

interface Props {
  documentName: string;
  leftOpen: boolean;
  rightOpen: boolean;
  userName: string;
  onToggleLeft: () => void;
  onToggleRight: () => void;
}

export function ViewerToolbar({
  documentName,
  leftOpen,
  rightOpen,
  userName,
  onToggleLeft,
  onToggleRight,
}: Props) {
  return (
    <header className="h-[70px] bg-[#0a0a0a] flex items-center px-[20px] py-[12px] gap-3 shrink-0 z-10">
      {/* Back pill */}
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white text-[16px] font-medium leading-5 transition-colors"
        title="Back to dashboard"
      >
        <MoveLeft className="w-[25px] h-[25px]" />
        Back
      </Link>

      {/* Toggle left sidebar */}
      <button
        onClick={onToggleLeft}
        className={`p-1.5 rounded text-sm transition-colors ${leftOpen ? "bg-white/15 text-white" : "text-white/40 hover:text-white/70"}`}
        title="Toggle notes panel"
      >
        <Menu className="w-[20px] h-[20px]" />
      </button>

      <div className="w-px h-5 bg-white/15 mx-1" />

      {/* Breadcrumb / document title */}
      <div className=" flex flex-col items-center gap-[2px]">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-5 h-5 text-white/50" />
          <span className="text-[20px] font-semibold leading-6 text-white/50">
            Paper :
          </span>
          <span className="text-[20px] font-semibold leading-6 text-white truncate max-w-[320px]">
            {documentName}
          </span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <span className=" text-[14px] leading-[20px] font-medium text-[#F1F5F9]">Special Board Meeting :</span>
          <span className=" text-[14px] leading-[20px] font-medium text-[#CBD5E1]">Fri, April 23 2026 | 11:30am - 02:30pm</span>
        </div>
      </div>

      <div className="flex-1" />

      {/* Board pack / Minutes */}
      <button
        type="button"
        className="flex items-center gap-[10px] h-[34px] px-[24px] py-[8px] rounded-[6px] border-[0.75px] border-white/25 text-white text-[14px] font-medium leading-[20px] hover:bg-white/10 transition-colors"
        title="Board pack"
      >
        Board pack
        <BookOpenText className="w-[16px] h-[16px]" />
      </button>
      <button
        type="button"
        className="flex items-center gap-[10px] h-[34px] px-[24px] py-[8px] rounded-[6px] border-[0.75px] border-white/25 text-white text-[14px] font-medium leading-[20px] hover:bg-white/10 transition-colors"
        title="Minutes"
      >
        Minutes
        <Clock className="w-[16px] h-[16px]" />
      </button>

      {/* Toggle right sidebar */}
      <button
        onClick={onToggleRight}
        className={`p-1.5 rounded text-sm transition-colors ${rightOpen ? "bg-white/15 text-white" : "text-white/40 hover:text-white/70"}`}
        title="Toggle AI chat"
      >
        <Menu className="w-[20px] h-[20px]" />
      </button>
    </header>
  );
}
