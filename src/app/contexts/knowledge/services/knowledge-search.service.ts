import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../../core/http/http.service';
import {
  RAGSearchRequest,
  RAGSearchResponse,
  ProductSearchResult,
  SummaryRequest,
  SummaryResponse,
  SearchContextResponse,
} from '../models/rag-search.model';

/**
 * Servicio para búsqueda RAG (Retrieval Augmented Generation)
 * Endpoints para búsqueda semántica y generación de respuestas
 */
@Injectable({
  providedIn: 'root',
})
export class KnowledgeSearchService {
  private readonly http = inject(HttpService);
  private readonly baseUrl = '/knowledge';

  /**
   * POST /api/v1/knowledge/answer
   * Buscar contexto relevante y generar respuesta con LLM
   */
  answerWithContext(request: RAGSearchRequest): Observable<RAGSearchResponse> {
    return this.http.post<RAGSearchResponse>(`${this.baseUrl}/answer`, request);
  }

  /**
   * POST /api/v1/knowledge/products/search
   * Búsqueda especializada para catálogo de productos
   */
  searchProducts(request: RAGSearchRequest): Observable<ProductSearchResult[]> {
    return this.http.post<ProductSearchResult[]>(`${this.baseUrl}/products/search`, request);
  }

  /**
   * POST /api/v1/knowledge/summarize
   * Generar resumen de múltiples documentos
   */
  summarizeDocuments(request: SummaryRequest): Observable<SummaryResponse> {
    return this.http.post<SummaryResponse>(`${this.baseUrl}/summarize`, request);
  }

  /**
   * POST /api/v1/knowledge/search
   * Búsqueda semántica de contexto relevante (sin LLM)
   */
  searchRelevantContext(query: string, topK?: number): Observable<SearchContextResponse> {
    return this.http.post<SearchContextResponse>(`${this.baseUrl}/search`, {
      query,
      topK: topK || 5,
    });
  }
}
