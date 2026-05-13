'use client';
import { useEffect, useRef, useState } from 'react';

interface Props {
  documentUrl: string;
  currentPage: number;
  onPageClick: (page: number) => void;
}

let thumbnailPdf: any = null;
let pdfjs: any = null;

export function ThumbnailSidebar({ documentUrl, currentPage, onPageClick }: Props) {
  const [pages, setPages] = useState<number[]>([]);
  const thumbnailRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const renderingRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    async function loadPdf() {
      if (!pdfjs) {
        const mod = await import('pdfjs-dist');
        pdfjs = mod;
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
      }
      const pdf = await pdfjs.getDocument({ url: documentUrl, withCredentials: true }).promise;
      thumbnailPdf = pdf;
      setPages(Array.from({ length: pdf.numPages }, (_, i) => i + 1));
    }
    loadPdf().catch(console.error);
  }, [documentUrl]);

  useEffect(() => {
    async function renderThumbnail(pageNum: number) {
      if (!thumbnailPdf || renderingRef.current.has(pageNum)) return;
      const canvas = thumbnailRefs.current.get(pageNum);
      if (!canvas || canvas.getAttribute('data-rendered')) return;

      renderingRef.current.add(pageNum);
      const page = await thumbnailPdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 0.25 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d')!;
      await page.render({ canvasContext: ctx, viewport }).promise;
      canvas.setAttribute('data-rendered', '1');
      renderingRef.current.delete(pageNum);
    }

    pages.forEach((p) => renderThumbnail(p));
  }, [pages]);

  return (
    <div className="h-full overflow-y-auto p-2 space-y-2">
      {pages.map((pageNum) => (
        <div
          key={pageNum}
          onClick={() => onPageClick(pageNum)}
          className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-colors ${
            currentPage === pageNum ? 'border-indigo-500' : 'border-transparent hover:border-slate-300'
          }`}
        >
          <canvas
            ref={(el) => { if (el) thumbnailRefs.current.set(pageNum, el); }}
            className="w-full block bg-slate-100"
          />
          <div className="text-center text-xs text-slate-400 py-0.5">{pageNum}</div>
        </div>
      ))}
    </div>
  );
}
