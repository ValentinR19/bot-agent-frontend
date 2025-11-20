/**
 * Modelos para búsqueda RAG (Retrieval Augmented Generation)
 */

export interface RAGSearchRequest {
  query: string;
  maxResults?: number;
}

export interface RAGSearchResponse {
  answer: string;
  sources: string[];
  chunks?: SearchChunk[];
}

export interface SearchChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  chunkText: string;
  similarity: number;
  metadata?: Record<string, any>;
}

export interface ProductSearchResult {
  name: string;
  description: string;
  price?: number;
  metadata?: Record<string, any>;
}

export interface SummaryRequest {
  documentIds: string[];
}

export interface SummaryResponse {
  summary: string;
}

export interface SearchContextRequest {
  query: string;
  topK?: number;
}

export interface SearchContextResponse {
  contexts: string[];
  chunks?: SearchChunk[];
}
