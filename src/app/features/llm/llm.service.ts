import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LLMHealthResponse, LLMTestResponse, EmbeddingTestResponse } from './llm.model';

/**
 * Servicio para gestionar LLM (health checks y testing)
 * Endpoints: /api/v1/llm
 * Requiere header X-Tenant-Id (manejado por interceptor)
 */
@Injectable({
  providedIn: 'root',
})
export class LLMService {
  private readonly apiUrl = `${environment.apiUrl}/llm`;

  constructor(private http: HttpClient) {}

  /**
   * Health check del servicio LLM
   * GET /api/v1/llm/health
   */
  checkHealth(): Observable<LLMHealthResponse> {
    return this.http.get<LLMHealthResponse>(`${this.apiUrl}/health`);
  }

  /**
   * Probar conexión con LLM
   * GET /api/v1/llm/test
   */
  testConnection(): Observable<LLMTestResponse> {
    return this.http.get<LLMTestResponse>(`${this.apiUrl}/test`);
  }

  /**
   * Probar generación de embeddings
   * GET /api/v1/llm/test-embeddings
   */
  testEmbeddings(): Observable<EmbeddingTestResponse> {
    return this.http.get<EmbeddingTestResponse>(`${this.apiUrl}/test-embeddings`);
  }
}
