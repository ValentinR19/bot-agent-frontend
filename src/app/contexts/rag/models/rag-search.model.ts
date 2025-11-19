/**
 * Modelos para búsqueda RAG (Retrieval-Augmented Generation)
 */

import type { ChunkWithDocument } from './knowledge-chunk.model';

export type { ChunkWithDocument } from './knowledge-chunk.model';

export interface RagSearchRequest {
  query: string;
  topK?: number; // Default: 5
  minSimilarity?: number; // Default: 0.7
  documentIds?: string[]; // Filtrar por documentos específicos
  documentTypes?: string[]; // Filtrar por tipos de documentos
  tags?: string[]; // Filtrar por tags
}

export interface RagSearchResponse {
  query: string;
  chunks: ChunkWithDocument[];
  totalResults: number;
  searchTime: number; // Milisegundos
}

export interface RagAnswerRequest {
  query: string;
  topK?: number;
  minSimilarity?: number;
  documentIds?: string[];
}

export interface RagAnswerResponse {
  answer: string;
  sources: ChunkWithDocument[];
  confidence: number;
  reasoning?: string;
}
