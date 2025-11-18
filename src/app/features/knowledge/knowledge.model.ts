/**
 * Modelos y DTOs para el feature Knowledge (RAG Documents)
 * Generados a partir de swagger-export.json
 */

export interface KnowledgeDocument {
  id: string;
  tenantId: string;
  title: string;
  content?: string;
  type: DocumentType;
  status: DocumentStatus;
  sourceUrl?: string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
  metadata?: Record<string, any>;
  chunks?: DocumentChunk[];
  processingStartedAt?: string;
  processingCompletedAt?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export enum DocumentType {
  TEXT = 'text',
  PDF = 'pdf',
  DOCX = 'docx',
  HTML = 'html',
  MARKDOWN = 'markdown',
  URL = 'url'
}

export enum DocumentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ARCHIVED = 'archived'
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  chunkIndex: number;
  startPosition: number;
  endPosition: number;
  embedding?: number[];
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface CreateKnowledgeDocumentDto {
  tenantId: string;
  title: string;
  content?: string;
  type: DocumentType;
  sourceUrl?: string;
  metadata?: Record<string, any>;
}

export interface UpdateKnowledgeDocumentDto {
  title?: string;
  content?: string;
  type?: DocumentType;
  status?: DocumentStatus;
  sourceUrl?: string;
  metadata?: Record<string, any>;
}

export interface KnowledgeDocumentResponseDto extends KnowledgeDocument {}

export interface DocumentSearchDto {
  query: string;
  type?: DocumentType;
  status?: DocumentStatus;
  limit?: number;
}

export interface UploadDocumentDto {
  tenantId: string;
  title: string;
  file: File;
  metadata?: Record<string, any>;
}
