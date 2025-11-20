/**
 * Modelo para Knowledge Chunks
 * Representan fragmentos de texto de un documento
 */

export interface KnowledgeChunk {
  id: string;
  documentId: string;
  chunkText: string;
  chunkIndex: number;
  tokenCount: number;
  metadata: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Chunk con información del documento padre
 */
export interface KnowledgeChunkWithDocument extends KnowledgeChunk {
  document?: {
    id: string;
    title: string;
    type: string;
  };
}
