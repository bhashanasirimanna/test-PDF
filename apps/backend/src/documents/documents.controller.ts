import {
  Controller, Post, Get, Param, Res, UseGuards,
  UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { DocumentsService } from './documents.service';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private docs: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  upload(
    @UploadedFile(new ParseFilePipe({ validators: [new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE })] }))
    file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    return this.docs.upload(file, user.sub);
  }

  @Get()
  findAll() {
    return this.docs.findAll();
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @CurrentUser() user: any, @Res() res: Response) {
    const buffer = await this.docs.getWatermarkedBuffer(id, user.email);
    const doc = await this.docs.findOne(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(doc.name)}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get(':id/print')
  async print(@Param('id') id: string, @CurrentUser() user: any, @Res() res: Response) {
    const buffer = await this.docs.getWatermarkedBuffer(id, user.email);
    const doc = await this.docs.findOne(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${encodeURIComponent(doc.name)}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get(':id/stream')
  async stream(@Param('id') id: string, @CurrentUser() user: any, @Res() res: Response) {
    const doc = await this.docs.findOne(id);
    const buffer = await this.docs.getWatermarkedBuffer(id, user.email);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline',
      'Content-Length': buffer.length,
      'Cache-Control': 'no-store',
    });
    res.end(buffer);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.docs.findOne(id);
  }
}
