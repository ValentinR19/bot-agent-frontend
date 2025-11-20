/**
 * RAG API Service
 * Maneja todas las llamadas HTTP al backend para el sistema RAG
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  KnowledgeDocument,
  CreateKnowledgeDocumentDto,
  UpdateKnowledgeDocumentDto,
  UploadDocumentResponse,
  IngestionStatus,
  DocumentType,
} from '../models/knowledge-document.model';
import { KnowledgeChunk } from '../models/knowledge-chunk.model';
import { RagSearchRequest, RagSearchResponse, RagAnswerRequest, RagAnswerResponse } from '../models/rag-search.model';

@Injectable({
  providedIn: 'root',
})
export class RagApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/knowledge`;
  private ragUrl = `${environment.apiUrl}/rag`;

  /**
   * Obtener listado de documentos
   */
  getDocuments(): Observable<KnowledgeDocument[]> {
    return this.http.get<KnowledgeDocument[]>(`${this.apiUrl}/documents`);
  }

  /**
   * Obtener documento por ID
   */
  getDocumentById(id: string): Observable<KnowledgeDocument> {
    return this.http.get<KnowledgeDocument>(`${this.apiUrl}/documents/${id}`);
  }

  /**
   * Crear documento manualmente (sin archivo)
   */
  createDocument(dto: CreateKnowledgeDocumentDto): Observable<KnowledgeDocument> {
    return this.http.post<KnowledgeDocument>(`${this.apiUrl}/documents`, dto);
  }

  /**
   * Subir documento (PDF, TXT, CSV)
   */
  uploadDocument(file: File, type: DocumentType, tags: string[] = []): Observable<UploadDocumentResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('tags', JSON.stringify(tags));

    return this.http.post<UploadDocumentResponse>(`${this.apiUrl}/documents/upload`, formData);
  }

  /**
   * Actualizar documento
   */
  updateDocument(id: string, dto: UpdateKnowledgeDocumentDto): Observable<KnowledgeDocument> {
    return this.http.put<KnowledgeDocument>(`${this.apiUrl}/documents/${id}`, dto);
  }

  /**
   * Eliminar documento
   */
  deleteDocument(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/documents/${id}`);
  }

  /**
   * Reintentar ingestión de documento
   */
  retryIngestion(documentId: string): Observable<KnowledgeDocument> {
    return this.http.post<KnowledgeDocument>(`${this.apiUrl}/documents/${documentId}/retry`, {});
  }

  /**
   * Obtener documentos por tipo
   */
  getDocumentsByType(type: DocumentType): Observable<KnowledgeDocument[]> {
    return this.http.get<KnowledgeDocument[]>(`${this.apiUrl}/documents/type/${type}`);
  }

  /**
   * Obtener documentos por estado
   */
  getDocumentsByStatus(status: IngestionStatus): Observable<KnowledgeDocument[]> {
    return this.http.get<KnowledgeDocument[]>(`${this.apiUrl}/documents/status/${status}`);
  }

  /**
   * Buscar documentos por título
   */
  searchDocuments(query: string): Observable<KnowledgeDocument[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<KnowledgeDocument[]>(`${this.apiUrl}/documents/search`, { params });
  }

  /**
   * Obtener chunks de un documento
   */
  getChunksByDocument(documentId: string): Observable<KnowledgeChunk[]> {
    return this.http.get<KnowledgeChunk[]>(`${this.apiUrl}/documents/${documentId}/chunks`);
  }

  /**
   * Búsqueda semántica RAG
   */
  search(request: RagSearchRequest): Observable<RagSearchResponse> {
    return this.http.post<RagSearchResponse>(`${this.ragUrl}/search`, request);
  }

  /**
   * Obtener respuesta con RAG (búsqueda + LLM)
   */
  answer(request: RagAnswerRequest): Observable<RagAnswerResponse> {
    return this.http.post<RagAnswerResponse>(`${this.ragUrl}/answer`, request);
  }

  /**
   * Obtener progreso de ingestión (polling o SSE)
   */
  getIngestionProgress(documentId: string): Observable<KnowledgeDocument> {
    return this.http.get<KnowledgeDocument>(`${this.apiUrl}/documents/${documentId}/progress`);
  }
}
