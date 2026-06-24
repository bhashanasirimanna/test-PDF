"use client";
import { useState } from "react";
import { Maximize, Pencil, Download, Printer, Check, Fullscreen, Undo, Undo2, Redo2, Menu } from "lucide-react";
import { api } from "@/lib/api";

interface Props {
  documentId: string;
  documentName: string;
  placingSignature: boolean;
  onSignClick: () => void;
}

export function DocumentToolbar({
  documentId,
  documentName,
  placingSignature,
  onSignClick,
}: Props) {
  const [reviewed, setReviewed] = useState(false);

  function handleDownload() {
    const a = document.createElement("a");
    a.href = api.getDownloadUrl(documentId);
    a.download = documentName;
    a.click();
  }

  function handlePrint() {
    window.open(api.getPrintUrl(documentId), "_blank");
  }

  function handleFullScreen() {
    const el = document.getElementById("pdf-preview");
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  }

  return (
    <div className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-[16px] py-[8px] gap-[167px] shrink-0">
      <button
        onClick={() => {}}
        className={`flex items-center p-[6.65px] rounded-full transition-colors text-slate-600 hover:bg-slate-100`}
        title="Toggle notes panel"
      >
        <Menu className="w-[20px] h-[20px]" />
      </button>
      <div className="flex items-center gap-[28px] ">
        <div className=" flex items-center gap-[6px] px-[16px]">
          <button
            onClick={() => {}}
            className={`flex items-center p-[6.65px] rounded-full transition-colors text-slate-600 hover:bg-slate-100`}
            title="Undo"
          >
            <Undo2 className="w-[14px] h-[14px]" />
          </button>
          <button
            onClick={() => {}}
            className={`flex items-center p-[6.65px] rounded-full transition-colors text-slate-600 hover:bg-slate-100`}
            title="Redo"
          >
            <Redo2 className="w-[14px] h-[14px]" />
          </button>
        </div>
        <div className=" flex items-center gap-[6px] px-[16px] border-x border-[#CBD5E1]">
          <button
            onClick={onSignClick}
            className={`flex items-center p-[6.65px] rounded-full transition-colors ${
              placingSignature
                ? "bg-brand-light text-brand-purple"
                : "text-slate-600 hover:bg-slate-100"
            }`}
            title={
              placingSignature ? "Cancel signature placement" : "Add signature"
            }
          >
            <Pencil className="w-[14px] h-[14px]" />
          </button>
          <button
            onClick={handlePrint}
            className={`flex items-center p-[6.65px] rounded-full transition-colors text-slate-600 hover:bg-slate-100`}
            title="Print with watermark"
          >
            <Printer className="w-[14px] h-[14px]" />
          </button>
          <button
            onClick={handleDownload}
            className={`flex items-center p-[6.65px] rounded-full transition-colors text-slate-600 hover:bg-slate-100`}
            title="Download with watermark"
          >
            <Download className="w-[14px] h-[14px]" />
          </button>
        </div>
        <div className=" flex items-center gap-[6px] px-[16px] min-w-[100px]">
          <button
            onClick={handleFullScreen}
            className="flex flex-row items-center gap-[6px] px-[8px] py-[3px] rounded-full text-[13px] font-medium text-[#0F172A] transition-colors hover:bg-slate-100"
            title="Full screen"
          >
            <Fullscreen className="w-[16px] h-[16px]" />
            Full Screen
          </button>
        </div>
      </div>
      {/* Left: annotation tools */}
      {/* <button
        onClick={onSignClick}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
          placingSignature ? 'bg-brand-light text-brand-purple' : 'text-slate-600 hover:bg-slate-100'
        }`}
        title={placingSignature ? 'Cancel signature placement' : 'Add signature'}
      >
        <Pencil className="w-4 h-4" />
        Sign
      </button>

      <div className="w-px h-5 bg-slate-200 mx-1" />

      <button
        onClick={handleFullScreen}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[13px] font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        title="Full screen"
      >
        <Maximize className="w-4 h-4" />
        Full Screen
      </button>

      <div className="flex-1" /> */}

      {/* Right: document actions */}
      {/* <button
        onClick={handleDownload}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[13px] font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        title="Download with watermark"
      >
        <Download className="w-4 h-4" />
        Download
      </button>
      <button
        onClick={handlePrint}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[13px] font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        title="Print with watermark"
      >
        <Printer className="w-4 h-4" />
        Print
      </button> */}

      <button
        onClick={() => setReviewed((v) => !v)}
        className={` min-w-[133px] flex items-center gap-[6px] px-[12px] py-[4px] rounded-full border text-[12px] leading-[20px] font-medium transition-colors ${
          reviewed
            ? "bg-[#229D00] border-[#229D00] text-white"
            : "bg-transparent border-[#E5E5E5] text-[#229D00] hover:bg-emerald-50"
        }`}
        title="Mark this paper as reviewed"
      >
        <Check className="w-[16px] h-[16px]" />
        <span className="min-w-[87px]">{reviewed ? "Reviewed" : "Mark Reviewed"}</span>
      </button>
    </div>
  );
}
