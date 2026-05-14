import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { S3Service } from '../common/s3.service';
import { WatermarkService } from '../common/watermark.service';
import { validateFileMagicBytes, ALLOWED_MIMETYPES } from '../common/file-validator';
import * as crypto from 'crypto';
import * as path from 'path';

// Dynamic import for libreoffice-convert to avoid startup errors when not installed
let libreConvert: any = null;
try {
  libreConvert = require('libreoffice-convert');
  libreConvert.convertAsync = require('util').promisify(libreConvert.convert);
} catch {
  // libreoffice-convert unavailable — TXT/PPTX conversion will fail gracefully
}

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private s3: S3Service,
    private watermark: WatermarkService,
  ) {}

  async upload(file: Express.Multer.File, userId: string) {
    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
      throw new BadRequestException('Unsupported file type');
    }

    if (!validateFileMagicBytes(file.buffer, file.mimetype)) {
      throw new BadRequestException('File content does not match declared type');
    }

    let pdfBuffer: Buffer = file.buffer;
    let finalMime = file.mimetype;

    if (file.mimetype !== 'application/pdf') {
      if (!libreConvert) {
        throw new BadRequestException('Document conversion not available on this server');
      }
      pdfBuffer = await libreConvert.convertAsync(file.buffer, '.pdf', undefined);
      finalMime = 'application/pdf';
    }

    const key = `documents/${userId}/${crypto.randomUUID()}${path.extname(file.originalname).replace(/\.(txt|pptx|docx|doc)$/i, '.pdf')}`;
    await this.s3.upload(key, pdfBuffer, finalMime);

    const doc = await this.prisma.document.create({
      data: {
        name: file.originalname.replace(/\.(txt|pptx|docx|doc)$/i, '.pdf'),
        s3Key: key,
        s3Url: `s3://${key}`,
        mimeType: finalMime,
        uploadedById: userId,
      },
      include: { uploadedBy: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    });

    return doc;
  }

  async findAll() {
    return this.prisma.document.findMany({
      include: { uploadedBy: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      include: { uploadedBy: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async getWatermarkedBuffer(id: string, username: string): Promise<Buffer> {
    const doc = await this.findOne(id);
    const pdfBuffer = await this.s3.getBuffer(doc.s3Key);
    const watermarked = await this.watermark.inject(pdfBuffer, username);
    return Buffer.from(watermarked);
  }
}
