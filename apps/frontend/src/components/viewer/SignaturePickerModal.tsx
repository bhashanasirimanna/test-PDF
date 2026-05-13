'use client';
import { useRef, useState, useEffect } from 'react';
import SignaturePad from 'signature_pad';

const STORAGE_KEY = 'prokoti_saved_signatures';
const MAX_SAVED = 5;

function getSaved(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function persistSaved(sigs: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sigs));
}

interface Props {
  onSelect: (dataUrl: string) => void;
  onClose: () => void;
}

export function SignaturePickerModal({ onSelect, onClose }: Props) {
  const [tab, setTab] = useState<'saved' | 'draw'>('saved');
  const [saved, setSaved] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);

  useEffect(() => {
    setSaved(getSaved());
  }, []);

  useEffect(() => {
    if (tab === 'draw' && canvasRef.current) {
      padRef.current = new SignaturePad(canvasRef.current, {
        backgroundColor: 'rgba(255,255,255,0)',
        penColor: '#1e293b',
      });
    }
    return () => {
      padRef.current?.off();
      padRef.current = null;
    };
  }, [tab]);

  function handleSelect(dataUrl: string) {
    const next = [dataUrl, ...getSaved().filter((s) => s !== dataUrl)].slice(0, MAX_SAVED);
    persistSaved(next);
    onSelect(dataUrl);
  }

  function handleCapture() {
    if (!padRef.current || padRef.current.isEmpty()) return;
    handleSelect(padRef.current.toDataURL('image/png'));
  }

  function handleDelete(idx: number) {
    const next = saved.filter((_, i) => i !== idx);
    persistSaved(next);
    setSaved(next);
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-[440px] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Select Signature</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg w-6 h-6 flex items-center justify-center rounded"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setTab('saved')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              tab === 'saved'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            My Signatures
          </button>
          <button
            onClick={() => setTab('draw')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              tab === 'draw'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Draw New
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'saved' && (
            saved.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm leading-relaxed">
                No saved signatures yet.<br />
                Switch to &ldquo;Draw New&rdquo; to create one.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {saved.map((sig, i) => (
                  <div
                    key={i}
                    className="relative group border border-slate-200 rounded-lg overflow-hidden hover:border-indigo-400 cursor-pointer transition-colors"
                    onClick={() => handleSelect(sig)}
                  >
                    <img
                      src={sig}
                      alt={`Signature ${i + 1}`}
                      className="w-full h-20 object-contain p-2 bg-slate-50"
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(i); }}
                      className="absolute top-1 right-1 bg-white/90 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-xs leading-none w-5 h-5 flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === 'draw' && (
            <div>
              <p className="text-xs text-slate-500 mb-3">Draw your signature below:</p>
              <canvas
                ref={canvasRef}
                width={380}
                height={150}
                className="border border-slate-300 rounded-lg w-full bg-slate-50"
                style={{ touchAction: 'none' }}
              />
              <div className="flex gap-2 mt-3 justify-between">
                <button
                  onClick={() => padRef.current?.clear()}
                  className="text-sm px-3 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Clear
                </button>
                <button
                  onClick={handleCapture}
                  className="text-sm px-4 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700 font-medium"
                >
                  Use Signature
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
