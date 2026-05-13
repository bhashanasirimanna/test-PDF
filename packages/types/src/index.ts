export enum AnnotationType {
  NOTE = 'NOTE',
  DISCUSSION = 'DISCUSSION',
  HIGHLIGHT = 'HIGHLIGHT',
  UNDERLINE = 'UNDERLINE',
  SIGNATURE = 'SIGNATURE',
}

export interface AnnotationRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface UserDto {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface DocumentDto {
  id: string;
  name: string;
  s3Key: string;
  s3Url: string;
  mimeType: string;
  uploadedBy: UserDto;
  createdAt: string;
}

export interface AnnotationDto {
  id: string;
  documentId: string;
  userId: string;
  user: UserDto;
  type: AnnotationType;
  pageNumber: number;
  rects: AnnotationRect[];
  selectedText: string;
  color: string;
  content: string;
  isPrivate: boolean;
  members?: UserDto[];
  replies?: ReplyDto[];
  createdAt: string;
  updatedAt: string;
}

export interface ReplyDto {
  id: string;
  annotationId: string;
  userId: string;
  user: UserDto;
  content: string;
  createdAt: string;
}

export interface CreateAnnotationDto {
  documentId: string;
  type: AnnotationType;
  pageNumber: number;
  rects: AnnotationRect[];
  selectedText?: string;
  color: string;
  content: string;
  isPrivate: boolean;
  memberIds?: string[];
}

export interface UpdateAnnotationDto {
  content?: string;
  color?: string;
  rects?: AnnotationRect[];
}

export interface CreateReplyDto {
  content: string;
}

export interface ShareAnnotationDto {
  memberIds: string[];
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponseDto {
  user: UserDto;
}

// Socket.IO event payloads
export interface WsJoinDocument {
  documentId: string;
}

export interface WsAnnotationEvent {
  annotation: AnnotationDto;
}

export interface WsReplyEvent {
  reply: ReplyDto;
  annotationId: string;
}

export interface WsDeleteEvent {
  annotationId: string;
}
