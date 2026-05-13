import {
  Controller, Post, Get, Patch, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { IsString, IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AnnotationType } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AnnotationsService } from './annotations.service';
import { AnnotationsGateway } from './annotations.gateway';

class RectDto {
  @IsNumber() x: number;
  @IsNumber() y: number;
  @IsNumber() w: number;
  @IsNumber() h: number;
}

class CreateAnnotationDto {
  @IsString() documentId: string;
  @IsEnum(AnnotationType) type: AnnotationType;
  @IsNumber() pageNumber: number;
  @IsArray() @ValidateNested({ each: true }) @Type(() => RectDto) rects: RectDto[];
  @IsString() @IsOptional() selectedText?: string;
  @IsString() color: string;
  @IsString() content: string;
  @IsBoolean() isPrivate: boolean;
  @IsArray() @IsString({ each: true }) @IsOptional() memberIds?: string[];
}

class UpdateAnnotationDto {
  @IsString() @IsOptional() content?: string;
  @IsString() @IsOptional() color?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => RectDto) @IsOptional() rects?: RectDto[];
}

class CreateReplyDto {
  @IsString() content: string;
}

class ShareDto {
  @IsArray() @IsString({ each: true }) memberIds: string[];
}

@Controller('annotations')
@UseGuards(JwtAuthGuard)
export class AnnotationsController {
  constructor(
    private annotations: AnnotationsService,
    private gateway: AnnotationsGateway,
  ) {}

  @Post()
  async create(@Body() dto: CreateAnnotationDto, @CurrentUser() user: any) {
    const annotation = await this.annotations.create(user.sub, dto);
    this.gateway.broadcastToDocument(annotation.documentId, 'annotation:created', { annotation });
    return annotation;
  }

  @Get('document/:docId')
  findForDocument(@Param('docId') docId: string, @CurrentUser() user: any) {
    return this.annotations.findForDocument(docId, user.sub);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAnnotationDto,
    @CurrentUser() user: any,
  ) {
    const annotation = await this.annotations.update(id, user.sub, dto);
    this.gateway.broadcastToDocument(annotation.documentId, 'annotation:updated', { annotation });
    return annotation;
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const { documentId } = await this.annotations.delete(id, user.sub);
    this.gateway.broadcastToDocument(documentId, 'annotation:deleted', { annotationId: id });
    return { success: true };
  }

  @Post(':id/replies')
  async addReply(
    @Param('id') annotationId: string,
    @Body() dto: CreateReplyDto,
    @CurrentUser() user: any,
  ) {
    const reply = await this.annotations.addReply(annotationId, user.sub, dto.content);
    // Need to fetch annotation documentId for broadcast
    this.gateway.broadcastReply(annotationId, reply);
    return reply;
  }

  @Post(':id/share')
  async share(
    @Param('id') id: string,
    @Body() dto: ShareDto,
    @CurrentUser() user: any,
  ) {
    const annotation = await this.annotations.share(id, user.sub, dto.memberIds);
    this.gateway.broadcastToDocument(annotation.documentId, 'annotation:updated', { annotation });
    return annotation;
  }
}
