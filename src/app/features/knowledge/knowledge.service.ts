import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpService } from '../../core/http/http.service';
import { CreateKnowledgeDocumentDto, DocumentStatus, DocumentType, KnowledgeDocument, KnowledgeDocumentSearchParams, UpdateKnowledgeDocumentDto } from './knowledge.model';

/**
 * Servicio para gestión de Knowledge (Documentos RAG)
 * Endpoints generados desde swagger-export.json
 */
@Injectable({
  providedIn: 'root',
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
  findAll(): Observable<KnowledgeDocument[]> {
    this.loadingSubject.next(true);

    return this.http.get<KnowledgeDocument[]>(this.baseUrl).pipe(
      tap({
        next: (documents) => {
          this.documentsSubject.next(documents);
          this.loadingSubject.next(false);
        },
        error: () => {
          this.loadingSubject.next(false);
        },
      }),
    );
  }

  /**
   * GET /api/v1/knowledge/documents/type/{type}
   * Listar documentos por tipo
   */
  findByType(type: DocumentType): Observable<KnowledgeDocument[]> {
    return this.http.get<KnowledgeDocument[]>(`${this.baseUrl}/type/${type}`);
  }

  /**
   * GET /api/v1/knowledge/documents/status/{status}
   * Listar documentos por estado
   */
  findByStatus(status: DocumentStatus): Observable<KnowledgeDocument[]> {
    return this.http.get<KnowledgeDocument[]>(`${this.baseUrl}/status/${status}`);
  }
  private toRecord(obj: any): Record<string, string> {
    const record: Record<string, string> = {};
    if (!obj) return record;

    Object.entries(obj).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        record[key] = String(value);
      }
    });

    return record;
  }
  /**
   * POST /api/v1/knowledge/documents/search
   * Buscar documentos
   */
  search(params: KnowledgeDocumentSearchParams): Observable<KnowledgeDocument[]> {
    const queryObj: any = {
      tags: params.tags?.length ? params.tags.join(',') : undefined,
      type: params.type,
      status: params.status,
    };

    const finalParams = this.toRecord(queryObj);

    return this.http.get<KnowledgeDocument[]>(`${this.baseUrl}/search`, {
      params: finalParams,
    });
  }

  /**
   * GET /api/v1/knowledge/documents/{id}
   * Obtener un documento por ID
   */
  findOne(id: string): Observable<KnowledgeDocument> {
    return this.http.get<KnowledgeDocument>(`${this.baseUrl}/${id}`);
  }

  /**
   * GET /api/v1/knowledge/documents/{id}/with-chunks
   * Obtener documento con sus chunks
   */
  findOneWithChunks(id: string): Observable<KnowledgeDocument> {
    return this.http.get<KnowledgeDocument>(`${this.baseUrl}/${id}/with-chunks`);
  }

  /**
   * POST /api/v1/knowledge/documents
   * Crear un nuevo documento
   */
  create(dto: CreateKnowledgeDocumentDto): Observable<KnowledgeDocument> {
    return this.http.post<KnowledgeDocument>(this.baseUrl, dto).pipe(
      tap((newDocument) => {
        const currentDocuments = this.documentsSubject.value;
        this.documentsSubject.next([...currentDocuments, newDocument]);
      }),
    );
  }

  /**
   * PUT /api/v1/knowledge/documents/{id}
   * Actualizar un documento
   */
  update(id: string, dto: UpdateKnowledgeDocumentDto): Observable<KnowledgeDocument> {
    return this.http.put<KnowledgeDocument>(`${this.baseUrl}/${id}`, dto).pipe(
      tap((updatedDocument) => {
        const currentDocuments = this.documentsSubject.value;
        const index = currentDocuments.findIndex((d) => d.id === id);
        if (index !== -1) {
          currentDocuments[index] = updatedDocument;
          this.documentsSubject.next([...currentDocuments]);
        }
      }),
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
        this.documentsSubject.next(currentDocuments.filter((d) => d.id !== id));
      }),
    );
  }

  /**
   * POST /api/v1/knowledge/documents/upload
   * Subir un archivo de documento
   */
  upload(formData: FormData): Observable<KnowledgeDocument> {
    return this.http.post<KnowledgeDocument>(`${this.baseUrl}/upload`, formData).pipe(
      tap((newDocument) => {
        const currentDocuments = this.documentsSubject.value;
        this.documentsSubject.next([...currentDocuments, newDocument]);
      }),
    );
  }

  /**
   * POST /api/v1/knowledge/documents/{id}/process
   * Procesar un documento (generar embeddings)
   */
  process(id: string): Observable<KnowledgeDocument> {
    return this.http.post<KnowledgeDocument>(`${this.baseUrl}/${id}/process`, {});
  }
}
