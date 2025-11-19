/**
 * Modelos para Knowledge Documents
 * Basados en el sistema RAG del backend
 */

export interface KnowledgeDocument {
  id: string;
  tenantId: string;
  title: string;
  content?: string;
  type: DocumentType;
  status: IngestionStatus;
  progress: number; // 0-100
  chunkCount: number;
  size?: number; // Tamaño en bytes
  fileName?: string;
  mimeType?: string;
  tags: string[];
  metadata?: Record<string, any>;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export enum DocumentType {
  FAQ = 'faq',
  PRODUCT_CATALOG = 'product_catalog',
  MANUAL = 'manual',
  POLICY = 'policy',
  GENERAL = 'general',
}

export enum IngestionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface CreateKnowledgeDocumentDto {
  title: string;
  content?: string;
  type: DocumentType;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateKnowledgeDocumentDto {
  title?: string;
  content?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  status?: IngestionStatus;
}

export interface UploadDocumentResponse {
  document: KnowledgeDocument;
  message: string;
}

export interface IngestionProgressEvent {
  documentId: string;
  progress: number;
  status: IngestionStatus;
  message?: string;
  chunkCount?: number;
}
