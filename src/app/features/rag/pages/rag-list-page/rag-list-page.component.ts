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
import { DocumentTableComponent } from '../../components/document-table/document-table.component';
import { DocumentUploadComponent } from '../../components/document-upload/document-upload.component';
import { RagSearchComponent } from '../../components/rag-search/rag-search.component';

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
  imports: [CommonModule, CardModule, ButtonModule, ToastModule, TabViewModule, BadgeModule, DocumentTableComponent, DocumentUploadComponent, RagSearchComponent],
  providers: [MessageService],
  template: `
    <div class="rag-list-page">
      <!-- Header -->
      <div class="page-header mb-4">
        <div class="flex justify-content-between align-items-center">
          <div>
            <h1 class="m-0 mb-2">Base de Conocimiento RAG</h1>
            <p class="text-gray-600 m-0">Gestión de documentos, chunks y búsqueda semántica</p>
          </div>
          <p-button label="Subir documento" icon="pi pi-upload" severity="success" (onClick)="openUploadDialog()"></p-button>
        </div>
      </div>

      <!-- Tabs -->
      <p-tabView>
        <!-- Tab: Documentos -->
        <p-tabPanel header="Documentos">
          <ng-template pTemplate="header">
            <div class="flex align-items-center gap-2">
              <i class="pi pi-file"></i>
              <span>Documentos</span>
              <p-badge [value]="documents.length" severity="info"></p-badge>
            </div>
          </ng-template>

          <div class="tab-content">
            <app-document-table [documents]="documents" (retryIngestion)="onRetryIngestion($event)" (deleteDocument)="onDeleteDocument($event)"></app-document-table>
          </div>
        </p-tabPanel>

        <!-- Tab: Búsqueda RAG -->
        <p-tabPanel header="Búsqueda RAG">
          <ng-template pTemplate="header">
            <div class="flex align-items-center gap-2">
              <i class="pi pi-search"></i>
              <span>Búsqueda RAG</span>
            </div>
          </ng-template>

          <div class="tab-content">
            <app-rag-search></app-rag-search>
          </div>
        </p-tabPanel>

        <!-- Tab: Estadísticas -->
        <p-tabPanel header="Estadísticas">
          <ng-template pTemplate="header">
            <div class="flex align-items-center gap-2">
              <i class="pi pi-chart-bar"></i>
              <span>Estadísticas</span>
            </div>
          </ng-template>

          <div class="tab-content">
            <div class="grid">
              <div class="col-12 md:col-6 lg:col-3">
                <p-card>
                  <div class="stat-card">
                    <i class="pi pi-file text-primary text-4xl mb-3"></i>
                    <div class="stat-value">{{ stats.totalDocuments }}</div>
                    <div class="stat-label">Total Documentos</div>
                  </div>
                </p-card>
              </div>

              <div class="col-12 md:col-6 lg:col-3">
                <p-card>
                  <div class="stat-card">
                    <i class="pi pi-check-circle text-green-500 text-4xl mb-3"></i>
                    <div class="stat-value">{{ stats.completedDocuments }}</div>
                    <div class="stat-label">Completados</div>
                  </div>
                </p-card>
              </div>

              <div class="col-12 md:col-6 lg:col-3">
                <p-card>
                  <div class="stat-card">
                    <i class="pi pi-spin pi-spinner text-orange-500 text-4xl mb-3"></i>
                    <div class="stat-value">{{ stats.processingDocuments }}</div>
                    <div class="stat-label">Procesando</div>
                  </div>
                </p-card>
              </div>

              <div class="col-12 md:col-6 lg:col-3">
                <p-card>
                  <div class="stat-card">
                    <i class="pi pi-database text-blue-500 text-4xl mb-3"></i>
                    <div class="stat-value">{{ stats.totalChunks }}</div>
                    <div class="stat-label">Total Chunks</div>
                  </div>
                </p-card>
              </div>
            </div>
          </div>
        </p-tabPanel>
      </p-tabView>

      <!-- Upload dialog -->
      <app-document-upload #uploadDialog (uploadComplete)="onUploadComplete()"></app-document-upload>

      <p-toast></p-toast>
    </div>
  `,
  styles: [
    `
      .rag-list-page {
        padding: 2rem;
      }

      .page-header h1 {
        font-size: 2rem;
        font-weight: 700;
        color: #1f2937;
      }

      .tab-content {
        padding: 1rem 0;
      }

      .stat-card {
        text-align: center;
        padding: 1rem;
      }

      .stat-value {
        font-size: 2.5rem;
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 0.5rem;
      }

      .stat-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      ::ng-deep .p-tabview .p-tabview-nav li .p-tabview-nav-link {
        padding: 1rem 1.5rem;
      }
    `,
  ],
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
