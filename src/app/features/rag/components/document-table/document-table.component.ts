/**
 * Document Table Component
 * Tabla de documentos con acciones (detalle, retry, delete)
 */

import { Component, OnInit, OnDestroy, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { KnowledgeDocument, IngestionStatus } from '../../models/knowledge-document.model';
import { RagStateService } from '../../services/rag-state.service';

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
  template: `
    <p-table [value]="documents" [paginator]="true" [rows]="10" [loading]="isLoading" responsiveLayout="scroll" [globalFilterFields]="['title', 'type', 'status']">
      <ng-template pTemplate="header">
        <tr>
          <th pSortableColumn="title">
            Documento <p-sortIcon field="title"></p-sortIcon>
          </th>
          <th pSortableColumn="type">
            Tipo <p-sortIcon field="type"></p-sortIcon>
          </th>
          <th pSortableColumn="status">
            Estado <p-sortIcon field="status"></p-sortIcon>
          </th>
          <th>Chunks</th>
          <th>Tamaño</th>
          <th pSortableColumn="updatedAt">
            Última actualización <p-sortIcon field="updatedAt"></p-sortIcon>
          </th>
          <th>Acciones</th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-doc>
        <tr>
          <td>
            <div class="document-title">
              <i class="pi pi-file text-primary mr-2"></i>
              <span>{{ doc.title }}</span>
            </div>
            <small class="text-gray-500" *ngIf="doc.fileName">{{ doc.fileName }}</small>
          </td>
          <td>
            <p-chip [label]="getTypeLabel(doc.type)" [style]="{ background: getTypeColor(doc.type), color: 'white', fontSize: '0.75rem' }"></p-chip>
          </td>
          <td>
            <p-badge [value]="getStatusLabel(doc.status)" [severity]="getStatusSeverity(doc.status)"></p-badge>
            <p-progressBar *ngIf="doc.status === 'processing'" [value]="doc.progress" [showValue]="true" class="mt-2"></p-progressBar>
          </td>
          <td class="text-center">
            <p-badge [value]="doc.chunkCount || 0" severity="info"></p-badge>
          </td>
          <td>{{ formatSize(doc.size) }}</td>
          <td>{{ doc.updatedAt | date : 'short' }}</td>
          <td>
            <div class="flex gap-2">
              <p-button icon="pi pi-eye" [rounded]="true" [text]="true" severity="info" pTooltip="Ver detalle" (onClick)="onViewDetail(doc)"></p-button>
              <p-button
                icon="pi pi-refresh"
                [rounded]="true"
                [text]="true"
                severity="warn"
                pTooltip="Reintentar ingestión"
                (onClick)="onRetryIngestion(doc)"
                *ngIf="doc.status === 'failed'"
              ></p-button>
              <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" pTooltip="Eliminar" (onClick)="onDelete(doc)"></p-button>
            </div>
          </td>
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="7" class="text-center p-5">
            <i class="pi pi-inbox text-6xl text-gray-300 mb-3"></i>
            <p class="text-gray-500">No hay documentos disponibles</p>
          </td>
        </tr>
      </ng-template>
    </p-table>

    <p-confirmDialog></p-confirmDialog>
    <p-toast></p-toast>
  `,
  styles: [
    `
      .document-title {
        display: flex;
        align-items: center;
        font-weight: 600;
      }

      ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
        padding: 1rem;
      }

      ::ng-deep .p-badge {
        font-size: 0.75rem;
      }
    `,
  ],
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
