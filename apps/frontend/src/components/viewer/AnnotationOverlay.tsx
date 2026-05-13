'use client';
import { useEffect, useRef, useState } from 'react';
import type { AnnotationDto, AnnotationRect } from '@prokoti/types';
import { AnnotationType } from '@prokoti/types';
import { hexToRgba } from '@/lib/colors';

interface Props {
  annotations: AnnotationDto[];
  scale: number;
  selectedAnnotationId: string | null;
  userId: string;
  onSelect: (id: string) => void;
  onAnnotationUpdate: (id: string, dto: { rects?: AnnotationRect[] }) => Promise<any>;
}

type Handle = 'move' | 'resize-tl' | 'resize-tr' | 'resize-bl' | 'resize-br';

interface DragState {
  type: Handle;
  startX: number;
  startY: number;
  origRect: AnnotationRect;
}

function ResizableSignature({
  annotation,
  scale,
  isSelected,
  isOwner,
  onSelect,
  onUpdate,
}: {
  annotation: AnnotationDto;
  scale: number;
  isSelected: boolean;
  isOwner: boolean;
  onSelect: () => void;
  onUpdate: (rects: AnnotationRect[]) => Promise<void>;
}) {
  const origRect = annotation.rects[0] as AnnotationRect;
  const [localRect, setLocalRect] = useState<AnnotationRect>(origRect);
  const localRectRef = useRef<AnnotationRect>(origRect);
  const dragRef = useRef<DragState | null>(null);

  // Sync when annotation updates externally (socket events)
  useEffect(() => {
    const r = annotation.rects[0] as AnnotationRect;
    localRectRef.current = r;
    setLocalRect(r);
  }, [annotation.rects]);

  function startDrag(e: React.MouseEvent, type: Handle) {
    if (!isOwner) return;
    e.stopPropagation();
    e.preventDefault();
    dragRef.current = {
      type,
      startX: e.clientX,
      startY: e.clientY,
      origRect: { ...localRectRef.current },
    };

    function onMove(ev: MouseEvent) {
      if (!dragRef.current) return;
      const dx = (ev.clientX - dragRef.current.startX) / scale;
      const dy = (ev.clientY - dragRef.current.startY) / scale;
      const o = dragRef.current.origRect;
      let next: AnnotationRect;
      switch (dragRef.current.type) {
        case 'move':
          next = { ...o, x: o.x + dx, y: o.y + dy };
          break;
        case 'resize-tl':
          next = { x: o.x + dx, y: o.y + dy, w: Math.max(30, o.w - dx), h: Math.max(20, o.h - dy) };
          break;
        case 'resize-tr':
          next = { x: o.x, y: o.y + dy, w: Math.max(30, o.w + dx), h: Math.max(20, o.h - dy) };
          break;
        case 'resize-bl':
          next = { x: o.x + dx, y: o.y, w: Math.max(30, o.w - dx), h: Math.max(20, o.h + dy) };
          break;
        case 'resize-br':
          next = { x: o.x, y: o.y, w: Math.max(30, o.w + dx), h: Math.max(20, o.h + dy) };
          break;
        default:
          return;
      }
      localRectRef.current = next;
      setLocalRect(next);
    }

    function onUp() {
      dragRef.current = null;
      onUpdate([localRectRef.current]);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  const HANDLE = 8;
  const corners: Array<{ key: Handle; style: React.CSSProperties; cursor: string }> = [
    { key: 'resize-tl', style: { top: -HANDLE / 2, left: -HANDLE / 2 }, cursor: 'nwse-resize' },
    { key: 'resize-tr', style: { top: -HANDLE / 2, right: -HANDLE / 2 }, cursor: 'nesw-resize' },
    { key: 'resize-bl', style: { bottom: -HANDLE / 2, left: -HANDLE / 2 }, cursor: 'nesw-resize' },
    { key: 'resize-br', style: { bottom: -HANDLE / 2, right: -HANDLE / 2 }, cursor: 'nwse-resize' },
  ];

  return (
    <div
      className="absolute"
      style={{
        left: localRect.x * scale,
        top: localRect.y * scale,
        width: localRect.w * scale,
        height: localRect.h * scale,
        cursor: isOwner ? 'move' : 'default',
        zIndex: isSelected ? 20 : 10,
      }}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onMouseDown={isOwner ? (e) => startDrag(e, 'move') : undefined}
    >
      <img
        src={annotation.content}
        alt="signature"
        draggable={false}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          opacity: isSelected ? 1 : 0.85,
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      />

      {isSelected && isOwner && (
        <>
          <div className="absolute inset-0 border-2 border-indigo-500 rounded pointer-events-none" />
          {corners.map(({ key, style, cursor }) => (
            <div
              key={key}
              className="absolute bg-white border-2 border-indigo-500 rounded-sm z-30"
              style={{
                width: HANDLE,
                height: HANDLE,
                cursor,
                ...style,
              }}
              onMouseDown={(e) => startDrag(e, key)}
            />
          ))}
        </>
      )}
    </div>
  );
}

export function AnnotationOverlay({
  annotations, scale, selectedAnnotationId, userId, onSelect, onAnnotationUpdate,
}: Props) {
  return (
    <div className="annotation-overlay pointer-events-none">
      {annotations
        .filter((a) => a.type !== 'SIGNATURE' && a.rects && a.rects.length > 0)
        .map((annotation) =>
          annotation.rects.map((rect: any, i: number) => {
            const isUnderline = annotation.type === AnnotationType.UNDERLINE;
            const isSelected = annotation.id === selectedAnnotationId;
            return (
              <div
                key={`${annotation.id}-${i}`}
                className={`annotation-highlight pointer-events-auto ${isSelected ? 'annotation-pulse' : ''}`}
                style={{
                  left: rect.x * scale,
                  top: rect.y * scale,
                  width: rect.w * scale,
                  height: rect.h * scale,
                  backgroundColor: isUnderline ? 'transparent' : hexToRgba(annotation.color, 0.4),
                  borderBottom: isUnderline ? `2px solid ${annotation.color}` : undefined,
                  opacity: isSelected ? 0.8 : 0.4,
                }}
                onClick={() => onSelect(annotation.id)}
                title={annotation.selectedText || annotation.content}
              />
            );
          }),
        )}

      {annotations
        .filter((a) => a.type === 'SIGNATURE' && a.rects?.length > 0 && a.content)
        .map((annotation) => (
          <ResizableSignature
            key={annotation.id}
            annotation={annotation}
            scale={scale}
            isSelected={annotation.id === selectedAnnotationId}
            isOwner={annotation.userId === userId}
            onSelect={() => onSelect(annotation.id)}
            onUpdate={(rects) => onAnnotationUpdate(annotation.id, { rects })}
          />
        ))}
    </div>
  );
}
