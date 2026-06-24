'use client';
import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAnnotations } from '@/hooks/useAnnotations';
import { api } from '@/lib/api';
import type { DocumentDto } from '@prokoti/types';
import { PDFViewer } from '@/components/viewer/PDFViewer';
import { LeftSidebar } from '@/components/viewer/LeftSidebar';
import { CosecAITab } from '@/components/viewer/CosecAITab';
import { ViewerToolbar } from '@/components/viewer/ViewerToolbar';
import { DocumentToolbar } from '@/components/viewer/DocumentToolbar';
import { PageZoomBar } from '@/components/viewer/PageZoomBar';
import { SignaturePickerModal } from '@/components/viewer/SignaturePickerModal';

export default function ViewerPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const { user, loading: authLoading } = useAuth();
  const [document, setDocument] = useState<DocumentDto | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [showSignaturePicker, setShowSignaturePicker] = useState(false);
  const [pendingSignature, setPendingSignature] = useState<string | null>(null);

  const {
    annotations,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
    addReply,
    shareAnnotation,
  } = useAnnotations(documentId, user?.id);

  // When an annotation is selected from the sidebar, also navigate to its page.
  // When selected from the PDF canvas itself, don't scroll (user is already there).
  const handleSidebarAnnotationSelect = useCallback(
    (id: string | null) => {
      setSelectedAnnotationId(id);
      if (id) {
        const ann = annotations.find((a) => a.id === id);
        if (ann) setCurrentPage(ann.pageNumber);
      }
    },
    [annotations],
  );

  useEffect(() => {
    api.get<DocumentDto>(`/documents/${documentId}`).then(setDocument).catch(console.error);
  }, [documentId]);

  // Restore scroll position
  useEffect(() => {
    const saved = localStorage.getItem(`viewer:${documentId}:page`);
    if (saved) setCurrentPage(parseInt(saved, 10) || 1);
  }, [documentId]);

  useEffect(() => {
    if (currentPage > 0) {
      localStorage.setItem(`viewer:${documentId}:page`, String(currentPage));
    }
  }, [currentPage, documentId]);

  // Cancel placement on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setPendingSignature(null);
        setShowSignaturePicker(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary" /></div>;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
      <ViewerToolbar
        documentName={document?.name || ''}
        leftOpen={leftOpen}
        rightOpen={rightOpen}
        onToggleLeft={() => setLeftOpen((v) => !v)}
        onToggleRight={() => setRightOpen((v) => !v)}
        userName={user.name}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left annotation sidebar: Pages / Notes / Discussions / Signatures */}
        <div
          className={`transition-all duration-150 overflow-hidden bg-white border-r border-slate-200 ${
            leftOpen ? 'w-[340px]' : 'w-0'
          }`}
        >
          {leftOpen && (
            <LeftSidebar
              annotations={annotations}
              userId={user.id}
              selectedAnnotationId={selectedAnnotationId}
              documentName={document?.name}
              documentUrl={api.getDocumentUrl(documentId)}
              currentPage={currentPage}
              onPageClick={setCurrentPage}
              onAnnotationSelect={handleSidebarAnnotationSelect}
              onAnnotationUpdate={updateAnnotation}
              onAnnotationDelete={deleteAnnotation}
              onReply={addReply}
              onShare={shareAnnotation}
            />
          )}
        </div>

        {/* PDF canvas area with sub-toolbar + floating page/zoom bar */}
        <div id="pdf-preview" className="flex-1 flex flex-col overflow-hidden relative bg-slate-100">
          <DocumentToolbar
            documentId={documentId}
            documentName={document?.name || ''}
            placingSignature={!!pendingSignature}
            onSignClick={() => {
              if (pendingSignature) {
                setPendingSignature(null);
              } else {
                setShowSignaturePicker(true);
              }
            }}
          />
          <div className="flex-1 overflow-auto">
          <PDFViewer
            documentUrl={api.getDocumentUrl(documentId)}
            currentPage={currentPage}
            scale={scale}
            annotations={annotations}
            userId={user.id}
            pendingSignature={pendingSignature}
            selectedAnnotationId={selectedAnnotationId}
            onPageChange={setCurrentPage}
            onTotalPagesChange={setTotalPages}
            onAnnotationCreate={(dto) => createAnnotation({ ...dto, documentId })}
            onAnnotationUpdate={updateAnnotation}
            onAnnotationSelect={setSelectedAnnotationId}
            onSignaturePlaced={() => setPendingSignature(null)}
          />
          </div>
          <PageZoomBar
            currentPage={currentPage}
            totalPages={totalPages}
            scale={scale}
            onPageChange={setCurrentPage}
            onScaleChange={setScale}
          />
        </div>

        {/* Right AI chat sidebar */}
        <div
          className={`transition-all duration-150 overflow-hidden bg-white border-l border-slate-200 ${
            rightOpen ? 'w-[320px]' : 'w-0'
          }`}
        >
          {rightOpen && <CosecAITab />}
        </div>
      </div>

      {showSignaturePicker && (
        <SignaturePickerModal
          onSelect={(dataUrl) => {
            setShowSignaturePicker(false);
            setPendingSignature(dataUrl);
          }}
          onClose={() => setShowSignaturePicker(false)}
        />
      )}
    </div>
  );
}
