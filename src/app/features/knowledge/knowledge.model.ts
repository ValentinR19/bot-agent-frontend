/**
 * Modelos y DTOs para el feature Knowledge (RAG Documents)
 * Generados a partir de swagger-export.json
 */

export type DocumentType = 'faq' | 'product_catalog' | 'manual' | 'policy' | 'general';

export type DocumentSourceType = 'file' | 'url' | 'manual' | 'api';

export type DocumentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface KnowledgeDocument {
  id: string;
  type: DocumentType;
  title: string;
  content: string;
  sourceType?: DocumentSourceType;
  sourceUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  status: DocumentStatus;
  errorMessage?: string;
  chunksCount: number;
  tags: string[];
  metadata: Record<string, any>;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateKnowledgeDocumentDto {
  type: DocumentType;
  title: string;
  content: string;
  sourceType?: DocumentSourceType;
  sourceUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateKnowledgeDocumentDto {
  type?: DocumentType;
  title?: string;
  sourceType?: DocumentSourceType;
  sourceUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  status?: DocumentStatus;
  errorMessage?: string;
}

export interface KnowledgeDocumentSearchParams {
  tags?: string[];
  type?: DocumentType;
  status?: DocumentStatus;
}

export interface UploadDocumentDto {
  file: File;
  type: DocumentType;
  title: string;
  tags?: string[];
  metadata?: Record<string, any>;
}
