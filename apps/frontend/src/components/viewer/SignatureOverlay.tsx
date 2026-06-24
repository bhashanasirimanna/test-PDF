'use client';
import { useRef, useState, useEffect } from 'react';
import SignaturePad from 'signature_pad';

interface Props {
  pageNum: number;
  scale: number;
  onPlace: (dataUrl: string, x: number, y: number, w: number, h: number) => Promise<void>;
}

export function SignatureOverlay({ pageNum, scale, onPlace }: Props) {
  const [open, setOpen] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);

  useEffect(() => {
    if (open && canvasRef.current) {
      padRef.current = new SignaturePad(canvasRef.current, {
        backgroundColor: 'rgba(255,255,255,0)',
        penColor: '#1e293b',
      });
    }
    return () => padRef.current?.off();
  }, [open]);

  function handleCapture() {
    if (padRef.current?.isEmpty()) return;
    setDataUrl(padRef.current!.toDataURL('image/png'));
    setOpen(false);
    setPlacing(true);
  }

  async function handlePageClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!placing || !dataUrl) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    const w = 150; // px in PDF coords
    const h = 60;
    await onPlace(dataUrl, x, y, w, h);
    setPlacing(false);
    setDataUrl(null);
  }

  return (
    <>
      {placing && (
        <div
          className="absolute inset-0 z-50 cursor-crosshair"
          style={{ backgroundColor: 'rgba(105,59,137,0.08)' }}
          onClick={handlePageClick}
          title="Click to place signature"
        >
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-xs px-3 py-1 rounded-full shadow">
            Click to place signature
          </div>
        </div>
      )}

      {!placing && (
        <button
          onClick={() => setOpen(true)}
          className="absolute bottom-2 right-2 z-20 bg-amber-500 hover:bg-amber-600 text-white text-xs px-3 py-1.5 rounded-full shadow-lg"
        >
          ✏️ Sign here
        </button>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" data-modal>
          <div className="bg-white rounded-xl shadow-2xl p-5 w-80">
            <h3 className="font-semibold text-slate-900 mb-3">Draw Signature</h3>
            <canvas
              ref={canvasRef}
              width={280}
              height={120}
              className="border border-slate-300 rounded w-full"
              style={{ touchAction: 'none' }}
            />
            <div className="flex gap-2 mt-3 justify-between">
              <button
                onClick={() => padRef.current?.clear()}
                className="btn-secondary text-sm py-1.5"
              >Clear</button>
              <div className="flex gap-2">
                <button onClick={() => setOpen(false)} className="btn-secondary text-sm py-1.5">Cancel</button>
                <button onClick={handleCapture} className="btn-primary text-sm py-1.5">Place on Page</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
