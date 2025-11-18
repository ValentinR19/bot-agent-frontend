/**
 * RAG Detail Page
 * Página de detalle de documento con información, chunks y progreso
 */

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, interval } from 'rxjs';
import { RagStateService } from '../../services/rag-state.service';
import { KnowledgeDocument, IngestionStatus } from '../../models/knowledge-document.model';
import { KnowledgeChunk } from '../../models/knowledge-chunk.model';

// Components
import { ChunkTableComponent } from '../../components/chunk-table/chunk-table.component';
import { IngestionProgressComponent } from '../../components/ingestion-progress/ingestion-progress.component';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TabViewModule } from 'primeng/tabview';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-rag-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    BadgeModule,
    ChipModule,
    DividerModule,
    ToastModule,
    TabViewModule,
    ConfirmDialogModule,
    ChunkTableComponent,
    IngestionProgressComponent,
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="rag-detail-page">
      <!-- Header -->
      <div class="page-header mb-4">
        <div class="flex justify-content-between align-items-center">
          <div class="flex align-items-center gap-3">
            <p-button icon="pi pi-arrow-left" [text]="true" [rounded]="true" severity="secondary" (onClick)="goBack()"></p-button>
            <div>
              <h1 class="m-0 mb-2">{{ document?.title || 'Cargando...' }}</h1>
              <p class="text-gray-600 m-0" *ngIf="document">{{ document.fileName || 'Documento de conocimiento' }}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <p-button
              label="Reintentar"
              icon="pi pi-refresh"
              severity="warn"
              (onClick)="onRetryIngestion()"
              *ngIf="document?.status === 'failed'"
              [disabled]="isRetrying"
            ></p-button>
            <p-button label="Eliminar" icon="pi pi-trash" severity="danger" (onClick)="onDelete()"></p-button>
          </div>
        </div>
      </div>

      <!-- Document info card -->
      <p-card class="mb-4" *ngIf="document">
        <div class="grid">
          <div class="col-12 md:col-6">
            <div class="info-row">
              <span class="info-label">Tipo:</span>
              <p-chip [label]="getTypeLabel(document.type)" [style]="{ background: getTypeColor(document.type), color: 'white' }"></p-chip>
            </div>
            <div class="info-row">
              <span class="info-label">Estado:</span>
              <p-badge [value]="getStatusLabel(document.status)" [severity]="getStatusSeverity(document.status)"></p-badge>
            </div>
            <div class="info-row">
              <span class="info-label">Chunks:</span>
              <p-badge [value]="document.chunkCount || 0" severity="info"></p-badge>
            </div>
          </div>

          <div class="col-12 md:col-6">
            <div class="info-row">
              <span class="info-label">Tamaño:</span>
              <span>{{ formatSize(document.size) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Creado:</span>
              <span>{{ document.createdAt | date : 'medium' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Actualizado:</span>
              <span>{{ document.updatedAt | date : 'medium' }}</span>
            </div>
          </div>

          <div class="col-12" *ngIf="document.tags && document.tags.length > 0">
            <p-divider></p-divider>
            <div class="info-row">
              <span class="info-label">Tags:</span>
              <div class="flex gap-2 flex-wrap">
                <p-chip *ngFor="let tag of document.tags" [label]="tag"></p-chip>
              </div>
            </div>
          </div>
        </div>
      </p-card>

      <!-- Progress card (solo si está processing o pending) -->
      <div class="mb-4" *ngIf="document && (document.status === 'processing' || document.status === 'pending')">
        <app-ingestion-progress [status]="document.status" [progress]="document.progress" [chunkCount]="document.chunkCount" [errorMessage]="document.errorMessage">
        </app-ingestion-progress>
      </div>

      <!-- Error message (solo si falló) -->
      <p-card class="mb-4" *ngIf="document?.status === 'failed'">
        <div class="error-message flex align-items-start gap-3">
          <i class="pi pi-exclamation-triangle text-red-500 text-3xl"></i>
          <div>
            <h3 class="mt-0 mb-2 text-red-600">Error en la ingestión</h3>
            <p class="m-0 text-gray-700">{{ document?.errorMessage || 'Ocurrió un error durante el procesamiento del documento.' }}</p>
          </div>
        </div>
      </p-card>

      <!-- Tabs -->
      <p-tabView *ngIf="document?.status === 'completed'">
        <!-- Tab: Chunks -->
        <p-tabPanel header="Chunks">
          <ng-template pTemplate="header">
            <div class="flex align-items-center gap-2">
              <i class="pi pi-database"></i>
              <span>Chunks</span>
              <p-badge [value]="chunks.length" severity="info"></p-badge>
            </div>
          </ng-template>

          <div class="tab-content">
            <app-chunk-table [chunks]="chunks"></app-chunk-table>
          </div>
        </p-tabPanel>

        <!-- Tab: Metadatos -->
        <p-tabPanel header="Metadatos" *ngIf="document?.metadata && Object.keys(document?.metadata || {}).length > 0">
          <ng-template pTemplate="header">
            <div class="flex align-items-center gap-2">
              <i class="pi pi-info-circle"></i>
              <span>Metadatos</span>
            </div>
          </ng-template>

          <div class="tab-content">
            <pre class="metadata-json">{{ document?.metadata | json }}</pre>
          </div>
        </p-tabPanel>
      </p-tabView>

      <p-toast></p-toast>
      <p-confirmDialog></p-confirmDialog>
    </div>
  `,
  styles: [
    `
      .rag-detail-page {
        padding: 2rem;
      }

      .page-header h1 {
        font-size: 2rem;
        font-weight: 700;
        color: #1f2937;
      }

      .info-row {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .info-label {
        font-weight: 600;
        color: #6b7280;
        min-width: 120px;
      }

      .error-message {
        padding: 1rem;
        background: #fef2f2;
        border-radius: 8px;
        border: 1px solid #fecaca;
      }

      .metadata-json {
        padding: 1.5rem;
        background: #2d3748;
        color: #e2e8f0;
        border-radius: 8px;
        overflow-x: auto;
        font-size: 0.875rem;
        line-height: 1.6;
      }

      .tab-content {
        padding: 1rem 0;
      }
    `,
  ],
})
export class RagDetailPageComponent implements OnInit, OnDestroy {
  private ragState = inject(RagStateService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private destroy$ = new Subject<void>();

  document: KnowledgeDocument | null = null;
  chunks: KnowledgeChunk[] = [];
  isRetrying = false;

  Object = Object;

  ngOnInit(): void {
    const documentId = this.route.snapshot.paramMap.get('id');

    if (documentId) {
      this.ragState.selectDocument(documentId);

      // Suscribirse a cambios en documento seleccionado
      this.ragState.selectedDocument$.pipe(takeUntil(this.destroy$)).subscribe((doc) => {
        this.document = doc;
      });

      // Suscribirse a cambios en chunks
      this.ragState.chunks$.pipe(takeUntil(this.destroy$)).subscribe((chunks) => {
        this.chunks = chunks;
      });

      // Polling si está procesando
      interval(3000)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          if (this.document && (this.document.status === IngestionStatus.PROCESSING || this.document.status === IngestionStatus.PENDING)) {
            this.ragState.refreshDocumentProgress(this.document.id);
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack(): void {
    this.router.navigate(['/rag']);
  }

  onRetryIngestion(): void {
    if (!this.document) return;

    this.confirmationService.confirm({
      message: `¿Deseas reintentar la ingestión del documento "${this.document.title}"?`,
      header: 'Confirmar reintento',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (this.document) {
          this.isRetrying = true;
          this.ragState.retryIngestion(this.document.id).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Reiniciado',
                detail: 'La ingestión ha sido reiniciada exitosamente.',
              });
              this.isRetrying = false;
            },
            error: (err) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: err.error?.message || 'Error al reintentar ingestión',
              });
              this.isRetrying = false;
            },
          });
        }
      },
    });
  }

  onDelete(): void {
    if (!this.document) return;

    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar el documento "${this.document.title}"? Esta acción no se puede deshacer.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (this.document) {
          this.ragState.deleteDocument(this.document.id).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Eliminado',
                detail: 'El documento ha sido eliminado.',
              });
              this.goBack();
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
      },
    });
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      faq: 'FAQ',
      product_catalog: 'Catálogo',
      manual: 'Manual',
      policy: 'Política',
      general: 'General',
    };
    return labels[type] || type;
  }

  getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      faq: '#3b82f6',
      product_catalog: '#10b981',
      manual: '#f59e0b',
      policy: '#ef4444',
      general: '#6b7280',
    };
    return colors[type] || '#6b7280';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      processing: 'Procesando',
      completed: 'Completado',
      failed: 'Fallido',
    };
    return labels[status] || status;
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' {
    const severities: Record<string, 'success' | 'info' | 'warn' | 'danger'> = {
      pending: 'info',
      processing: 'warn',
      completed: 'success',
      failed: 'danger',
    };
    return severities[status] || 'info';
  }

  formatSize(bytes?: number): string {
    if (!bytes) return '-';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  }
}
