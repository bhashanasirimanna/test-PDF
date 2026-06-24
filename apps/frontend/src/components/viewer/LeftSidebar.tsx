"use client";
import { useState } from "react";
import type { AnnotationDto } from "@prokoti/types";
import { AnnotationType } from "@prokoti/types";
import { NotesTab } from "./NotesTab";
import { DiscussionsTab } from "./DiscussionsTab";
import { SignaturesTab } from "./SignaturesTab";
import { ThumbnailSidebar } from "./ThumbnailSidebar";
import { Layers, MessagesSquare, NotebookPen, Pencil, StickyNote } from "lucide-react";

interface Props {
  annotations: AnnotationDto[];
  userId: string;
  selectedAnnotationId: string | null;
  documentName?: string;
  documentUrl: string;
  currentPage: number;
  onPageClick: (page: number) => void;
  onAnnotationSelect: (id: string | null) => void;
  onAnnotationUpdate: (
    id: string,
    dto: { content?: string; color?: string },
  ) => Promise<AnnotationDto>;
  onAnnotationDelete: (id: string) => Promise<void>;
  onReply: (annotationId: string, content: string) => Promise<any>;
  onShare: (id: string, memberIds: string[]) => Promise<AnnotationDto>;
}

type Tab = "pages" | "notes" | "discussions" | "signatures";

export function LeftSidebar({
  annotations,
  userId,
  selectedAnnotationId,
  documentName,
  documentUrl,
  currentPage,
  onPageClick,
  onAnnotationSelect,
  onAnnotationUpdate,
  onAnnotationDelete,
  onReply,
  onShare,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("notes");

  const notes = annotations.filter(
    (a) =>
      a.isPrivate && a.userId === userId && a.type !== AnnotationType.SIGNATURE,
  );
  const discussions = annotations.filter(
    (a) =>
      !a.isPrivate &&
      (a.type === AnnotationType.DISCUSSION || a.type === AnnotationType.NOTE),
  );
  const signatures = annotations.filter(
    (a) => a.type === AnnotationType.SIGNATURE,
  );

  const tabs: {
    id: Tab;
    label: string;
    count: number;
    icon?: React.ReactNode;
  }[] = [
    // {
    //   id: "pages",
    //   label: "Pages",
    //   count: 0,
    //   icon: <Layers className="h-[16px] w-[16px]" />,
    // },
    {
      id: "notes",
      label: "Notes",
      count: notes.length,
      icon: <StickyNote className="h-[16px] w-[16px]" />,
    },
    {
      id: "discussions",
      label: "Discussions",
      count: discussions.length,
      icon: <MessagesSquare className="h-[16px] w-[16px]" />,
    },
    // {
    //   id: "signatures",
    //   label: "Signatures",
    //   count: signatures.length,
    //   icon: <Pencil className="h-[16px] w-[16px]" />,
    // },
  ];

  return (
    <div className="flex flex-col gap-[20px] h-full min-w-[346px]">
      {/* Segmented tab control */}
      <div className="pt-[16px] px-[20px] flex flex-col gap-[20px]">
        <div className="flex gap-0 p-[4px] bg-[#F1F5F9] rounded-[8px]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-[6px] h-[34px] px-[12px] py-[6px] rounded-[6px] text-[14px] leading-[20px] font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-[#551B8C] text-white"
                  : "text-[#551B8C] hover:bg-white/60"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`text-[11px] rounded-full px-1.5 py-0.5 leading-none ${
                    activeTab === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-brand-light text-brand-purple"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
        {(activeTab === "discussions" || activeTab === "notes") && (<div className=" flex justify-between items-center">
          <span className="text-[16px] leading-[20px] font-medium text-[#475569]">
            {activeTab === "notes" ? "All notes on this Paper" : "Discussions on this Paper "}{" "}
            <span className="text-[#020617]">
              {`(`}
              {activeTab === "notes" ? notes.length : discussions.length}
              {`)`}
            </span>
          </span>
        </div>)}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "pages" && (
          <ThumbnailSidebar
            documentUrl={documentUrl}
            currentPage={currentPage}
            onPageClick={onPageClick}
          />
        )}
        {activeTab === "notes" && (
          <NotesTab
            notes={notes}
            selectedAnnotationId={selectedAnnotationId}
            userId={userId}
            onSelect={onAnnotationSelect}
            onDelete={onAnnotationDelete}
            onShare={onShare}
            documentName={documentName}
          />
        )}
        {activeTab === "discussions" && (
          <DiscussionsTab
            discussions={discussions}
            userId={userId}
            selectedAnnotationId={selectedAnnotationId}
            onSelect={onAnnotationSelect}
            onReply={onReply}
            onShare={onShare}
          />
        )}
        {activeTab === "signatures" && (
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
