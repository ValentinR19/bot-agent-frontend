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
import { ChunkTableComponent } from './components/chunk-table/chunk-table.component';
import { IngestionProgressComponent } from './components/ingestion-progress/ingestion-progress.component';

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
  templateUrl: './rag-detail-page.component.html',
  styleUrls: ['./rag-detail-page.component.scss'],
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
