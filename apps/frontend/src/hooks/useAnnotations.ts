'use client';
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { getSocket } from '@/lib/socket';
import type { AnnotationDto, CreateAnnotationDto, AnnotationRect } from '@prokoti/types';

export function useAnnotations(documentId: string, userId: string | undefined) {
  const [annotations, setAnnotations] = useState<AnnotationDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!documentId) return;
    api.get<AnnotationDto[]>(`/annotations/document/${documentId}`)
      .then(setAnnotations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [documentId]);

  useEffect(() => {
    if (!documentId) return;
    const socket = getSocket();

    socket.emit('join-document', { documentId });

    socket.on('annotation:created', ({ annotation }: { annotation: AnnotationDto }) => {
      setAnnotations((prev) => {
        if (prev.some((a) => a.id === annotation.id)) return prev;
        // Only add if visible to this user
        if (annotation.isPrivate && annotation.userId !== userId) return prev;
        return [annotation, ...prev];
      });
    });

    socket.on('annotation:updated', ({ annotation }: { annotation: AnnotationDto }) => {
      setAnnotations((prev) => {
        const exists = prev.some((a) => a.id === annotation.id);
        if (exists) return prev.map((a) => a.id === annotation.id ? annotation : a);
        // Wasn't in state (was private, now shared with this user) — add it
        if (annotation.isPrivate) return prev;
        return [annotation, ...prev];
      });
    });

    socket.on('annotation:deleted', ({ annotationId }: { annotationId: string }) => {
      setAnnotations((prev) => prev.filter((a) => a.id !== annotationId));
    });

    socket.on('reply:created', ({ reply, annotationId }: { reply: any; annotationId: string }) => {
      setAnnotations((prev) =>
        prev.map((a) =>
          a.id === annotationId
            ? { ...a, replies: [...(a.replies || []), reply] }
            : a,
        ),
      );
    });

    return () => {
      socket.off('annotation:created');
      socket.off('annotation:updated');
      socket.off('annotation:deleted');
      socket.off('reply:created');
      socket.emit('leave-document', { documentId });
    };
  }, [documentId, userId]);

  const createAnnotation = useCallback(
    async (dto: CreateAnnotationDto) => {
      const annotation = await api.post<AnnotationDto>('/annotations', dto);
      // Update state immediately — don't rely on the socket event arriving back
      // to the creator (socket auth may fail, or server may only broadcast to others).
      setAnnotations((prev) => {
        if (prev.some((a) => a.id === annotation.id)) return prev;
        return [annotation, ...prev];
      });
      return annotation;
    },
    [],
  );

  const updateAnnotation = useCallback(
    async (id: string, dto: { content?: string; color?: string; rects?: AnnotationRect[] }) => {
      const updated = await api.patch<AnnotationDto>(`/annotations/${id}`, dto);
      setAnnotations((prev) => prev.map((a) => (a.id === id ? updated : a)));
      return updated;
    },
    [],
  );

  const deleteAnnotation = useCallback(async (id: string) => {
    await api.delete(`/annotations/${id}`);
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const addReply = useCallback(async (annotationId: string, content: string) => {
    const reply = await api.post<any>(`/annotations/${annotationId}/replies`, { content });
    setAnnotations((prev) =>
      prev.map((a) =>
        a.id === annotationId
          ? { ...a, replies: [...(a.replies || []), reply] }
          : a,
      ),
    );
    return reply;
  }, []);

  const shareAnnotation = useCallback(async (id: string, memberIds: string[]) => {
    const updated = await api.post<AnnotationDto>(`/annotations/${id}/share`, { memberIds });
    setAnnotations((prev) => prev.map((a) => (a.id === id ? updated : a)));
    return updated;
  }, []);

  return {
    annotations,
    loading,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
    addReply,
    shareAnnotation,
  };
}
