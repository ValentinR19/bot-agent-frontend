/**
 * Document Table Component
 * Tabla de documentos con acciones (detalle, retry, delete)
 */

import { Component, OnInit, OnDestroy, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { KnowledgeDocument, IngestionStatus } from '../../../../models/knowledge-document.model';
import { RagStateService } from '../../../../services/rag-state.service';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { ChipModule } from 'primeng/chip';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-document-table',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, BadgeModule, ChipModule, TooltipModule, ConfirmDialogModule, ToastModule, ProgressBarModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './document-table.component.html',
  styleUrls: ['./document-table.component.scss'],
})
export class DocumentTableComponent implements OnInit, OnDestroy {
  private ragState = inject(RagStateService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private destroy$ = new Subject<void>();

  @Input() documents: KnowledgeDocument[] = [];
  @Output() retryIngestion = new EventEmitter<KnowledgeDocument>();
  @Output() deleteDocument = new EventEmitter<KnowledgeDocument>();

  isLoading = false;

  ngOnInit(): void {
    this.ragState.isLoading$.pipe(takeUntil(this.destroy$)).subscribe((loading) => {
      this.isLoading = loading;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onViewDetail(doc: KnowledgeDocument): void {
    this.router.navigate(['/rag', doc.id]);
  }

  onRetryIngestion(doc: KnowledgeDocument): void {
    this.confirmationService.confirm({
      message: `¿Deseas reintentar la ingestión del documento "${doc.title}"?`,
      header: 'Confirmar reintento',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.retryIngestion.emit(doc);
      },
    });
  }

  onDelete(doc: KnowledgeDocument): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar el documento "${doc.title}"? Esta acción no se puede deshacer.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteDocument.emit(doc);
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
