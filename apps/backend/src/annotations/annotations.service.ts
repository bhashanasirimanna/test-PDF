import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AnnotationType } from '@prisma/client';
import * as xss from 'xss';

const userSelect = { id: true, name: true, email: true, avatarUrl: true };

function sanitize(str: string): string {
  return xss.filterXSS(str);
}

@Injectable()
export class AnnotationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: {
    documentId: string;
    type: AnnotationType;
    pageNumber: number;
    rects: any[];
    selectedText?: string;
    color: string;
    content: string;
    isPrivate: boolean;
    memberIds?: string[];
  }) {
    const membersData = !dto.isPrivate && dto.memberIds?.length
      ? { create: dto.memberIds.map((uid) => ({ userId: uid })) }
      : undefined;

    return this.prisma.annotation.create({
      data: {
        documentId: dto.documentId,
        userId,
        type: dto.type,
        pageNumber: dto.pageNumber,
        rects: dto.rects,
        selectedText: sanitize(dto.selectedText || ''),
        color: dto.color,
        content: sanitize(dto.content),
        isPrivate: dto.isPrivate,
        members: membersData,
      },
      include: {
        user: { select: userSelect },
        members: { include: { user: { select: userSelect } } },
        replies: { include: { user: { select: userSelect } }, orderBy: { createdAt: 'asc' } },
      },
    });
  }

  async findForDocument(documentId: string, userId: string) {
    return this.prisma.annotation.findMany({
      where: {
        documentId,
        OR: [
          { userId },
          { isPrivate: false, members: { some: { userId } } },
          // Also show own annotations regardless
        ],
      },
      include: {
        user: { select: userSelect },
        members: { include: { user: { select: userSelect } } },
        replies: { include: { user: { select: userSelect } }, orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, userId: string, dto: { content?: string; color?: string; rects?: any[] }) {
    const annotation = await this.prisma.annotation.findUnique({ where: { id } });
    if (!annotation) throw new NotFoundException('Annotation not found');
    if (annotation.userId !== userId) throw new ForbiddenException();

    return this.prisma.annotation.update({
      where: { id },
      data: {
        ...(dto.content !== undefined ? { content: sanitize(dto.content) } : {}),
        ...(dto.color !== undefined ? { color: dto.color } : {}),
        ...(dto.rects !== undefined ? { rects: dto.rects } : {}),
      },
      include: {
        user: { select: userSelect },
        members: { include: { user: { select: userSelect } } },
        replies: { include: { user: { select: userSelect } }, orderBy: { createdAt: 'asc' } },
      },
    });
  }

  async delete(id: string, userId: string) {
    const annotation = await this.prisma.annotation.findUnique({ where: { id } });
    if (!annotation) throw new NotFoundException('Annotation not found');
    if (annotation.userId !== userId) throw new ForbiddenException();
    await this.prisma.annotation.delete({ where: { id } });
    return { documentId: annotation.documentId };
  }

  async addReply(annotationId: string, userId: string, content: string) {
    const annotation = await this.prisma.annotation.findUnique({ where: { id: annotationId } });
    if (!annotation) throw new NotFoundException('Annotation not found');

    const reply = await this.prisma.discussionReply.create({
      data: { annotationId, userId, content: sanitize(content) },
      include: { user: { select: userSelect } },
    });

    return reply;
  }

  async share(annotationId: string, userId: string, memberIds: string[]) {
    const annotation = await this.prisma.annotation.findUnique({ where: { id: annotationId } });
    if (!annotation) throw new NotFoundException('Annotation not found');
    if (annotation.userId !== userId) throw new ForbiddenException();

    await this.prisma.discussionMember.createMany({
      data: memberIds.map((uid) => ({ annotationId, userId: uid })),
      skipDuplicates: true,
    });

    return this.prisma.annotation.update({
      where: { id: annotationId },
      data: { isPrivate: false },
      include: {
        user: { select: userSelect },
        members: { include: { user: { select: userSelect } } },
        replies: { include: { user: { select: userSelect } }, orderBy: { createdAt: 'asc' } },
      },
    });
  }
}
