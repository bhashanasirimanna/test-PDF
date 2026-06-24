'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import type { AnnotationDto, AnnotationRect, CreateAnnotationDto } from '@prokoti/types';
import { AnnotationType } from '@prokoti/types';
import { AnnotationToolbar } from './AnnotationToolbar';
import { AnnotationOverlay } from './AnnotationOverlay';

// Module-level singleton — avoids re-importing on every render
let pdfjs: any = null;

interface Props {
  documentUrl: string;
  currentPage: number;
  scale: number;
  annotations: AnnotationDto[];
  userId: string;
  pendingSignature: string | null;
  selectedAnnotationId: string | null;
  onPageChange: (p: number) => void;
  onTotalPagesChange: (t: number) => void;
  onAnnotationCreate: (dto: CreateAnnotationDto) => Promise<AnnotationDto>;
  onAnnotationUpdate: (id: string, dto: { rects?: AnnotationRect[] }) => Promise<any>;
  onAnnotationSelect: (id: string | null) => void;
  onSignaturePlaced: () => void;
}

interface SelectionInfo {
  rects: Array<{ x: number; y: number; w: number; h: number }>;
  selectedText: string;
  pageNumber: number;
  screenX: number;
  screenY: number;
}

interface RenderedPage {
  pageNum: number;
  canvas: HTMLCanvasElement;
  textLayerDiv: HTMLDivElement;
  viewport: any;
}

export function PDFViewer({
  documentUrl, currentPage, scale, annotations, userId,
  pendingSignature, selectedAnnotationId,
  onPageChange, onTotalPagesChange, onAnnotationCreate,
  onAnnotationUpdate, onAnnotationSelect, onSignaturePlaced,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<any>(null);
  const renderedPagesRef = useRef<Map<number, RenderedPage>>(new Map());
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [renderKeys, setRenderKeys] = useState<number[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const loadingRef = useRef(false);
  // While a programmatic scroll is in flight, suppress intersection-observer
  // callbacks so they can't trigger a competing scrollIntoView call.
  const programmaticScrollRef = useRef(false);
  const programmaticScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load PDF.js and document
  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    loadingRef.current = false;
    pdfDocRef.current = null;
    renderedPagesRef.current.clear();
    setRenderKeys([]);

    async function load() {
      if (loadingRef.current) return;
      loadingRef.current = true;

      if (!pdfjs) {
        const mod = await import('pdfjs-dist');
        pdfjs = mod;
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      }

      const loadingTask = pdfjs.getDocument({
        url: documentUrl,
        withCredentials: true,
      });

      const pdf = await loadingTask.promise;
      if (cancelled) return;

      pdfDocRef.current = pdf;
      const n = pdf.numPages;
      onTotalPagesChange(n);
      setRenderKeys(Array.from({ length: n }, (_, i) => i + 1));
      loadingRef.current = false;
    }

    load().catch((err) => {
      console.error('PDF load error:', err);
      setLoadError(err?.message || 'Failed to load PDF');
    });

    return () => { cancelled = true; };
  }, [documentUrl]);


  // Scroll to current page when changed from toolbar/thumbnail/sidebar
  useEffect(() => {
    const el = pageRefs.current.get(currentPage);
    if (!el) return;
    programmaticScrollRef.current = true;
    if (programmaticScrollTimerRef.current) clearTimeout(programmaticScrollTimerRef.current);
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    programmaticScrollTimerRef.current = setTimeout(() => {
      programmaticScrollRef.current = false;
    }, 900);
  }, [currentPage]);

  // Intersection observer — tracks which page is visible
  useEffect(() => {
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (programmaticScrollRef.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const pageNum = parseInt(visible.target.getAttribute('data-page') || '0', 10);
          if (pageNum > 0) onPageChange(pageNum);
        }
      },
      { root: null, threshold: 0.3 },
    );
    pageRefs.current.forEach((el) => observerRef.current!.observe(el));
    return () => observerRef.current?.disconnect();
  }, [renderKeys]);

  const renderPage = useCallback(
    async (pageNum: number, wrapperDiv: HTMLDivElement) => {
      if (!pdfDocRef.current || !pdfjs || !wrapperDiv) return;
      const cached = renderedPagesRef.current.get(pageNum);
      if (cached && cached.viewport.scale === scale) return;

      const docSnapshot = pdfDocRef.current;
      const page = await docSnapshot.getPage(pageNum);

      // Guard: document changed or pdfjs was reset while we were awaiting
      if (pdfDocRef.current !== docSnapshot || !pdfjs) return;

      const viewport = page.getViewport({ scale });

      wrapperDiv.innerHTML = '';
      wrapperDiv.style.cssText = `width:${viewport.width}px;height:${viewport.height}px;position:relative;background:white`;

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.display = 'block';
      wrapperDiv.appendChild(canvas);

      const textLayerDiv = document.createElement('div');
      textLayerDiv.className = 'textLayer';
      textLayerDiv.style.setProperty('--scale-factor', String(scale));
      pdfjs.setLayerDimensions(textLayerDiv, viewport);
      wrapperDiv.appendChild(textLayerDiv);

      const ctx = canvas.getContext('2d')!;

      const [, textContent] = await Promise.all([
        page.render({ canvasContext: ctx, viewport }).promise,
        page.getTextContent(),
      ]);

      await document.fonts.ready;

      const textLayer = new pdfjs.TextLayer({
        textContentSource: textContent,
        container: textLayerDiv,
        viewport,
      });
      await textLayer.render();

      renderedPagesRef.current.set(pageNum, { pageNum, canvas, textLayerDiv, viewport });
    },
    [scale],
  );

  // Text selection → floating annotation toolbar
  const handleMouseUp = useCallback(
    (pageNum: number) => (e: React.MouseEvent) => {
      if (pendingSignature) return;
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.toString().trim() === '') return;

      const range = sel.getRangeAt(0);
      const clientRects = Array.from(range.getClientRects()).filter((r) => r.width > 0 && r.height > 0);
      const rendered = renderedPagesRef.current.get(pageNum);
      if (!rendered) return;

      const canvasRect = rendered.canvas.getBoundingClientRect();
      const rects = clientRects.map((r) => ({
        x: (r.left - canvasRect.left) / scale,
        y: (r.top - canvasRect.top) / scale,
        w: r.width / scale,
        h: r.height / scale,
      }));
      if (rects.length === 0) return;

      const spans = Array.from(rendered.textLayerDiv.querySelectorAll<HTMLSpanElement>('span'));
      const overlapping = spans.filter((span) => {
        const sr = span.getBoundingClientRect();
        if (!sr.width || !sr.height || !span.textContent?.trim()) return false;
        return clientRects.some(
          (cr) =>
            Math.min(sr.right, cr.right) - Math.max(sr.left, cr.left) > 0 &&
            Math.min(sr.bottom, cr.bottom) - Math.max(sr.top, cr.top) > sr.height * 0.3,
        );
      });
      overlapping.sort((a, b) => {
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        const threshold = Math.min(ra.height, rb.height) * 0.5;
        if (Math.abs(ra.top - rb.top) > threshold) return ra.top - rb.top;
        return ra.left - rb.left;
      });

      if (overlapping.length === 0) {
        setSelection({ rects, selectedText: sel.toString().trim(), pageNumber: pageNum, screenX: e.clientX, screenY: e.clientY });
        return;
      }

      const measureCtx = document.createElement('canvas').getContext('2d')!;

      function charsInVisualRange(span: HTMLSpanElement, fromPx: number, toPx: number): string {
        const text = span.textContent ?? '';
        if (!text) return '';
        const sr = span.getBoundingClientRect();
        if (!sr.width) return text;
        const cs = window.getComputedStyle(span);
        measureCtx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        const naturalW = measureCtx.measureText(text).width;
        if (!naturalW) return text;
        const sx = sr.width / naturalW;
        const cum = (k: number) => measureCtx.measureText(text.slice(0, k)).width * sx;
        let start = 0;
        if (fromPx > 0) {
          let found = false;
          for (let i = 0; i < text.length; i++) {
            if (cum(i + 1) >= fromPx) { start = i; found = true; break; }
          }
          if (!found) return '';
        }
        let end = text.length;
        for (let i = start; i < text.length; i++) {
          if (cum(i) >= toPx) { end = i; break; }
        }
        return text.slice(start, end);
      }

      const firstRect = clientRects[0];
      const lastRect  = clientRects[clientRects.length - 1];

      let selectedText = '';
      overlapping.forEach((span, i) => {
        const isFirst = i === 0;
        const isLast  = i === overlapping.length - 1;
        if (!isFirst && !isLast) { selectedText += span.textContent ?? ''; return; }
        const sr = span.getBoundingClientRect();
        const fromPx = isFirst ? Math.max(0, firstRect.left - sr.left) : 0;
        const toPx   = isLast  ? Math.max(0, lastRect.right - sr.left) : sr.width;
        selectedText += charsInVisualRange(span, fromPx, toPx);
      });

      setSelection({
        rects,
        selectedText: selectedText.replace(/\s+/g, ' ').trim(),
        pageNumber: pageNum,
        screenX: e.clientX,
        screenY: e.clientY,
      });
    },
    [scale, pendingSignature],
  );

  function dismissSelection() {
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
        <div className="text-4xl">⚠️</div>
        <p className="font-medium">Could not load PDF</p>
        <p className="text-sm text-slate-400 max-w-xs text-center">{loadError}</p>
      </div>
    );
  }

  if (renderKeys.length === 0) {
    return (
      <div className="flex items-center justify-center h-full gap-3 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary" />
        <span className="text-sm">Loading PDF…</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-4 py-6 px-4 relative">
      {pendingSignature && (
        <div className="sticky top-2 z-50 pointer-events-none">
          <div className="bg-brand-primary text-white text-xs px-4 py-1.5 rounded-full shadow-lg inline-block">
            Click on the page to place your signature — press Esc to cancel
          </div>
        </div>
      )}

      {renderKeys.map((pageNum) => (
        <PageWrapper
          key={pageNum}
          pageNum={pageNum}
          scale={scale}
          annotations={annotations.filter((a) => a.pageNumber === pageNum)}
          selectedAnnotationId={selectedAnnotationId}
          userId={userId}
          pendingSignature={pendingSignature}
          onAnnotationCreate={onAnnotationCreate}
          onAnnotationUpdate={onAnnotationUpdate}
          onAnnotationSelect={onAnnotationSelect}
          onSignaturePlaced={onSignaturePlaced}
          onMount={(el) => {
            if (el) pageRefs.current.set(pageNum, el);
          }}
          onMouseUp={handleMouseUp(pageNum)}
          renderPage={renderPage}
        />
      ))}

      {selection && (
        <AnnotationToolbar
          selection={selection}
          onClose={dismissSelection}
          onAnnotationCreate={async (dto) => { await onAnnotationCreate(dto); dismissSelection(); }}
        />
      )}
    </div>
  );
}

function PageWrapper({
  pageNum, scale, annotations, selectedAnnotationId, userId,
  pendingSignature, onAnnotationCreate, onAnnotationUpdate,
  onAnnotationSelect, onSignaturePlaced, onMount, onMouseUp, renderPage,
}: {
  pageNum: number;
  scale: number;
  annotations: AnnotationDto[];
  selectedAnnotationId: string | null;
  userId: string;
  pendingSignature: string | null;
  onAnnotationCreate: (dto: CreateAnnotationDto) => Promise<AnnotationDto>;
  onAnnotationUpdate: (id: string, dto: { rects?: AnnotationRect[] }) => Promise<any>;
  onAnnotationSelect: (id: string | null) => void;
  onSignaturePlaced: () => void;
  onMount: (el: HTMLDivElement | null) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  renderPage: (pageNum: number, el: HTMLDivElement) => Promise<void>;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const renderRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  // Signature preview dimensions (in screen px)
  const SIG_W = 150;
  const SIG_H = 60;

  useEffect(() => {
    onMount(outerRef.current);
    if (renderRef.current) renderPage(pageNum, renderRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (renderRef.current) renderPage(pageNum, renderRef.current);
  }, [scale, pageNum, renderPage]);

  // Clear cursor preview when placement mode is cancelled
  useEffect(() => {
    if (!pendingSignature) setCursorPos(null);
  }, [pendingSignature]);

  function handlePlacementMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  async function handlePlacementClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!pendingSignature) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - SIG_W / 2) / scale;
    const y = (e.clientY - rect.top - SIG_H / 2) / scale;
    const w = SIG_W / scale;
    const h = SIG_H / scale;
    await onAnnotationCreate({
      documentId: '',
      type: AnnotationType.SIGNATURE,
      pageNumber: pageNum,
      rects: [{ x, y, w, h }],
      color: '#000000',
      content: pendingSignature,
      isPrivate: true,
    } as any);
    onSignaturePlaced();
  }

  return (
    <div
      ref={outerRef}
      data-page={pageNum}
      className="relative shadow-lg bg-white"
      onMouseUp={onMouseUp}
    >
      <div ref={renderRef} className="relative" style={{ minWidth: 200, minHeight: 280 }}>
        <div className="absolute inset-0 bg-slate-200 animate-pulse rounded" />
      </div>

      <AnnotationOverlay
        annotations={annotations}
        scale={scale}
        selectedAnnotationId={selectedAnnotationId}
        userId={userId}
        onSelect={onAnnotationSelect}
        onAnnotationUpdate={onAnnotationUpdate}
      />

      {/* Signature placement overlay */}
      {pendingSignature && (
        <div
          className="absolute inset-0 z-40 cursor-crosshair"
          style={{ backgroundColor: 'rgba(99,102,241,0.06)' }}
          onMouseMove={handlePlacementMouseMove}
          onMouseLeave={() => setCursorPos(null)}
          onClick={handlePlacementClick}
        >
          {cursorPos && (
            <img
              src={pendingSignature}
              alt="signature preview"
              style={{
                position: 'absolute',
                left: cursorPos.x - SIG_W / 2,
                top: cursorPos.y - SIG_H / 2,
                width: SIG_W,
                height: SIG_H,
                objectFit: 'contain',
                opacity: 0.6,
                pointerEvents: 'none',
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
