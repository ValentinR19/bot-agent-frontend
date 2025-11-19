/**
 * RAG List Page
 * Página principal con listado de documentos, búsqueda y subida
 */

import { Component, OnInit, OnDestroy, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, interval } from 'rxjs';
import { RagStateService } from '../../services/rag-state.service';
import { KnowledgeDocument, IngestionStatus } from '../../models/knowledge-document.model';

// Components
import { DocumentTableComponent } from '../rag-detail-page/components/document-table/document-table.component';
import { DocumentUploadComponent } from '../rag-detail-page/components/document-upload/document-upload.component';
import { RagSearchComponent } from '../rag-detail-page/components/rag-search/rag-search.component';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TabViewModule } from 'primeng/tabview';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-rag-list-page',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ToastModule,
    TabViewModule,
    BadgeModule,
    DocumentTableComponent,
    DocumentUploadComponent,
    RagSearchComponent,
  ],
  providers: [MessageService],
  templateUrl: './rag-list-page.component.html',
  styleUrls: ['./rag-list-page.component.scss'],
})
export class RagListPageComponent implements OnInit, OnDestroy {
  private ragState = inject(RagStateService);
  private messageService = inject(MessageService);
  private destroy$ = new Subject<void>();

  @ViewChild('uploadDialog') uploadDialog!: DocumentUploadComponent;

  documents: KnowledgeDocument[] = [];
  stats = {
    totalDocuments: 0,
    completedDocuments: 0,
    processingDocuments: 0,
    totalChunks: 0,
  };

  ngOnInit(): void {
    // Cargar documentos inicialmente
    this.ragState.loadDocuments();

    // Suscribirse a cambios en documentos
    this.ragState.documents$.pipe(takeUntil(this.destroy$)).subscribe((documents) => {
      this.documents = documents;
      this.calculateStats();
    });

    // Polling para documentos en procesamiento (cada 3 segundos)
    interval(3000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.refreshProcessingDocuments();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openUploadDialog(): void {
    this.uploadDialog.open();
  }

  onUploadComplete(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Documento subido correctamente. La ingestión ha comenzado.',
    });
    this.ragState.loadDocuments();
  }

  onRetryIngestion(doc: KnowledgeDocument): void {
    this.ragState.retryIngestion(doc.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Reiniciado',
          detail: `La ingestión del documento "${doc.title}" se ha reiniciado.`,
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Error al reintentar ingestión',
        });
      },
    });
  }

  onDeleteDocument(doc: KnowledgeDocument): void {
    this.ragState.deleteDocument(doc.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Eliminado',
          detail: `El documento "${doc.title}" ha sido eliminado.`,
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Error al eliminar documento',
        });
      },
    });
  }

  private calculateStats(): void {
    this.stats.totalDocuments = this.documents.length;
    this.stats.completedDocuments = this.documents.filter((d) => d.status === IngestionStatus.COMPLETED).length;
    this.stats.processingDocuments = this.documents.filter((d) => d.status === IngestionStatus.PROCESSING || d.status === IngestionStatus.PENDING).length;
    this.stats.totalChunks = this.documents.reduce((sum, doc) => sum + (doc.chunkCount || 0), 0);
  }

  private refreshProcessingDocuments(): void {
    const processingDocs = this.documents.filter((d) => d.status === IngestionStatus.PROCESSING || d.status === IngestionStatus.PENDING);

    processingDocs.forEach((doc) => {
      this.ragState.refreshDocumentProgress(doc.id);
    });
  }
}
