/**
 * RAG State Service
 * Maneja el estado centralizado del módulo RAG con RxJS
 */

import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, finalize, tap } from 'rxjs';
import { RagApiService } from './rag-api.service';
import { KnowledgeDocument, DocumentType, IngestionStatus } from '../models/knowledge-document.model';
import { KnowledgeChunk } from '../models/knowledge-chunk.model';
import { RagSearchRequest, RagSearchResponse, ChunkWithDocument } from '../models/rag-search.model';

interface RagState {
  documents: KnowledgeDocument[];
  selectedDocument: KnowledgeDocument | null;
  chunks: KnowledgeChunk[];
  searchResults: ChunkWithDocument[];
  isLoading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class RagStateService {
  private ragApi = inject(RagApiService);

  private stateSubject = new BehaviorSubject<RagState>({
    documents: [],
    selectedDocument: null,
    chunks: [],
    searchResults: [],
    isLoading: false,
    error: null,
  });

  // Observables públicos
  public state$ = this.stateSubject.asObservable();
  public documents$ = new BehaviorSubject<KnowledgeDocument[]>([]);
  public selectedDocument$ = new BehaviorSubject<KnowledgeDocument | null>(null);
  public chunks$ = new BehaviorSubject<KnowledgeChunk[]>([]);
  public searchResults$ = new BehaviorSubject<ChunkWithDocument[]>([]);
  public isLoading$ = new BehaviorSubject<boolean>(false);
  public error$ = new BehaviorSubject<string | null>(null);

  /**
   * Cargar todos los documentos
   */
  loadDocuments(): void {
    this.setLoading(true);
    this.ragApi
      .getDocuments()
      .pipe(
        tap((documents) => {
          this.documents$.next(documents);
          this.setError(null);
        }),
        finalize(() => this.setLoading(false))
      )
      .subscribe({
        error: (err) => this.setError(err.message || 'Error al cargar documentos'),
      });
  }

  /**
   * Cargar documentos por tipo
   */
  loadDocumentsByType(type: DocumentType): void {
    this.setLoading(true);
    this.ragApi
      .getDocumentsByType(type)
      .pipe(
        tap((documents) => {
          this.documents$.next(documents);
          this.setError(null);
        }),
        finalize(() => this.setLoading(false))
      )
      .subscribe({
        error: (err) => this.setError(err.message || 'Error al cargar documentos por tipo'),
      });
  }

  /**
   * Cargar documentos por estado
   */
  loadDocumentsByStatus(status: IngestionStatus): void {
    this.setLoading(true);
    this.ragApi
      .getDocumentsByStatus(status)
      .pipe(
        tap((documents) => {
          this.documents$.next(documents);
          this.setError(null);
        }),
        finalize(() => this.setLoading(false))
      )
      .subscribe({
        error: (err) => this.setError(err.message || 'Error al cargar documentos por estado'),
      });
  }

  /**
   * Seleccionar documento y cargar chunks
   */
  selectDocument(id: string | null): void {
    if (!id) {
      this.selectedDocument$.next(null);
      this.chunks$.next([]);
      return;
    }

    this.setLoading(true);
    this.ragApi
      .getDocumentById(id)
      .pipe(
        tap((document) => {
          this.selectedDocument$.next(document);
          this.loadChunks(id);
        }),
        finalize(() => this.setLoading(false))
      )
      .subscribe({
        error: (err) => this.setError(err.message || 'Error al cargar documento'),
      });
  }

  /**
   * Cargar chunks de un documento
   */
  loadChunks(documentId: string): void {
    this.ragApi.getChunksByDocument(documentId).subscribe({
      next: (chunks) => {
        this.chunks$.next(chunks);
        this.setError(null);
      },
      error: (err) => this.setError(err.message || 'Error al cargar chunks'),
    });
  }

  /**
   * Subir documento
   */
  uploadDocument(file: File, type: DocumentType, tags: string[] = []): Observable<any> {
    this.setLoading(true);
    return this.ragApi.uploadDocument(file, type, tags).pipe(
      tap(() => {
        // Recargar lista de documentos después de subir
        this.loadDocuments();
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Eliminar documento
   */
  deleteDocument(id: string): Observable<void> {
    this.setLoading(true);
    return this.ragApi.deleteDocument(id).pipe(
      tap(() => {
        // Actualizar lista local
        const currentDocs = this.documents$.value;
        this.documents$.next(currentDocs.filter((doc) => doc.id !== id));
        if (this.selectedDocument$.value?.id === id) {
          this.selectedDocument$.next(null);
          this.chunks$.next([]);
        }
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Reintentar ingestión
   */
  retryIngestion(documentId: string): Observable<KnowledgeDocument> {
    this.setLoading(true);
    return this.ragApi.retryIngestion(documentId).pipe(
      tap((updatedDoc) => {
        // Actualizar documento en la lista
        const currentDocs = this.documents$.value;
        const index = currentDocs.findIndex((d) => d.id === documentId);
        if (index !== -1) {
          currentDocs[index] = updatedDoc;
          this.documents$.next([...currentDocs]);
        }
        if (this.selectedDocument$.value?.id === documentId) {
          this.selectedDocument$.next(updatedDoc);
        }
      }),
      finalize(() => this.setLoading(false))
    );
  }

  /**
   * Búsqueda RAG
   */
  search(request: RagSearchRequest): void {
    this.setLoading(true);
    this.ragApi
      .search(request)
      .pipe(
        tap((response) => {
          this.searchResults$.next(response.chunks);
          this.setError(null);
        }),
        finalize(() => this.setLoading(false))
      )
      .subscribe({
        error: (err) => this.setError(err.message || 'Error en búsqueda RAG'),
      });
  }

  /**
   * Limpiar resultados de búsqueda
   */
  clearSearchResults(): void {
    this.searchResults$.next([]);
  }

  /**
   * Actualizar progreso de un documento (polling)
   */
  refreshDocumentProgress(documentId: string): void {
    this.ragApi.getDocumentById(documentId).subscribe({
      next: (updatedDoc) => {
        // Actualizar en la lista
        const currentDocs = this.documents$.value;
        const index = currentDocs.findIndex((d) => d.id === documentId);
        if (index !== -1) {
          currentDocs[index] = updatedDoc;
          this.documents$.next([...currentDocs]);
        }
        // Actualizar si es el documento seleccionado
        if (this.selectedDocument$.value?.id === documentId) {
          this.selectedDocument$.next(updatedDoc);
        }
      },
      error: (err) => console.error('Error refreshing document progress:', err),
    });
  }

  // Helpers privados
  private setLoading(loading: boolean): void {
    this.isLoading$.next(loading);
  }

  private setError(error: string | null): void {
    this.error$.next(error);
  }

  /**
   * Limpiar estado
   */
  clear(): void {
    this.documents$.next([]);
    this.selectedDocument$.next(null);
    this.chunks$.next([]);
    this.searchResults$.next([]);
    this.setError(null);
    this.setLoading(false);
  }
}
