import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpService } from '../../core/http/http.service';
import {
  KnowledgeDocument,
  CreateKnowledgeDocumentDto,
  UpdateKnowledgeDocumentDto,
  KnowledgeDocumentResponseDto,
  DocumentType,
  DocumentStatus,
  DocumentSearchDto
} from './knowledge.model';

/**
 * Servicio para gestión de Knowledge (Documentos RAG)
 * Endpoints generados desde swagger-export.json
 */
@Injectable({
  providedIn: 'root'
})
export class KnowledgeService {
  private readonly http = inject(HttpService);
  private readonly baseUrl = '/api/v1/knowledge/documents';

  // Estado interno (mini-store)
  private documentsSubject = new BehaviorSubject<KnowledgeDocument[]>([]);
  public documents$ = this.documentsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  /**
   * GET /api/v1/knowledge/documents
   * Listar todos los documentos
   */
  findAll(): Observable<KnowledgeDocumentResponseDto[]> {
    this.loadingSubject.next(true);

    return this.http.get<KnowledgeDocumentResponseDto[]>(this.baseUrl).pipe(
      tap({
        next: (documents) => {
          this.documentsSubject.next(documents);
          this.loadingSubject.next(false);
        },
        error: () => {
          this.loadingSubject.next(false);
        }
      })
    );
  }

  /**
   * GET /api/v1/knowledge/documents/type/{type}
   * Listar documentos por tipo
   */
  findByType(type: DocumentType): Observable<KnowledgeDocumentResponseDto[]> {
    return this.http.get<KnowledgeDocumentResponseDto[]>(`${this.baseUrl}/type/${type}`);
  }

  /**
   * GET /api/v1/knowledge/documents/status/{status}
   * Listar documentos por estado
   */
  findByStatus(status: DocumentStatus): Observable<KnowledgeDocumentResponseDto[]> {
    return this.http.get<KnowledgeDocumentResponseDto[]>(`${this.baseUrl}/status/${status}`);
  }

  /**
   * POST /api/v1/knowledge/documents/search
   * Buscar documentos
   */
  search(dto: DocumentSearchDto): Observable<KnowledgeDocumentResponseDto[]> {
    return this.http.post<KnowledgeDocumentResponseDto[]>(`${this.baseUrl}/search`, dto);
  }

  /**
   * GET /api/v1/knowledge/documents/{id}
   * Obtener un documento por ID
   */
  findOne(id: string): Observable<KnowledgeDocumentResponseDto> {
    return this.http.get<KnowledgeDocumentResponseDto>(`${this.baseUrl}/${id}`);
  }

  /**
   * GET /api/v1/knowledge/documents/{id}/with-chunks
   * Obtener documento con sus chunks
   */
  findOneWithChunks(id: string): Observable<KnowledgeDocumentResponseDto> {
    return this.http.get<KnowledgeDocumentResponseDto>(`${this.baseUrl}/${id}/with-chunks`);
  }

  /**
   * POST /api/v1/knowledge/documents
   * Crear un nuevo documento
   */
  create(dto: CreateKnowledgeDocumentDto): Observable<KnowledgeDocumentResponseDto> {
    return this.http.post<KnowledgeDocumentResponseDto>(this.baseUrl, dto).pipe(
      tap((newDocument) => {
        const currentDocuments = this.documentsSubject.value;
        this.documentsSubject.next([...currentDocuments, newDocument]);
      })
    );
  }

  /**
   * PUT /api/v1/knowledge/documents/{id}
   * Actualizar un documento
   */
  update(id: string, dto: UpdateKnowledgeDocumentDto): Observable<KnowledgeDocumentResponseDto> {
    return this.http.put<KnowledgeDocumentResponseDto>(`${this.baseUrl}/${id}`, dto).pipe(
      tap((updatedDocument) => {
        const currentDocuments = this.documentsSubject.value;
        const index = currentDocuments.findIndex(d => d.id === id);
        if (index !== -1) {
          currentDocuments[index] = updatedDocument;
          this.documentsSubject.next([...currentDocuments]);
        }
      })
    );
  }

  /**
   * DELETE /api/v1/knowledge/documents/{id}
   * Eliminar un documento (soft delete)
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        const currentDocuments = this.documentsSubject.value;
        this.documentsSubject.next(currentDocuments.filter(d => d.id !== id));
      })
    );
  }

  /**
   * POST /api/v1/knowledge/documents/upload
   * Subir un archivo de documento
   */
  upload(formData: FormData): Observable<KnowledgeDocumentResponseDto> {
    return this.http.post<KnowledgeDocumentResponseDto>(`${this.baseUrl}/upload`, formData).pipe(
      tap((newDocument) => {
        const currentDocuments = this.documentsSubject.value;
        this.documentsSubject.next([...currentDocuments, newDocument]);
      })
    );
  }

  /**
   * POST /api/v1/knowledge/documents/{id}/process
   * Procesar un documento (generar embeddings)
   */
  process(id: string): Observable<KnowledgeDocumentResponseDto> {
    return this.http.post<KnowledgeDocumentResponseDto>(`${this.baseUrl}/${id}/process`, {});
  }
}
