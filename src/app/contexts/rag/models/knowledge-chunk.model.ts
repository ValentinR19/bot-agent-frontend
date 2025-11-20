/**
 * Modelos para Knowledge Chunks
 * Chunks de texto con embeddings vectoriales
 */

export interface KnowledgeChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  chunkText: string;
  tokenCount: number;
  embedding?: number[]; // Vector de 1536 dimensiones (opcional para UI)
  similarityScore?: number; // Solo cuando proviene de búsqueda
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ChunkWithDocument extends KnowledgeChunk {
  document?: {
    id: string;
    title: string;
    type: string;
  };
}

export interface ChunkPreview {
  id: string;
  chunkIndex: number;
  preview: string; // Primeros N caracteres
  tokenCount: number;
  similarityScore?: number;
}
