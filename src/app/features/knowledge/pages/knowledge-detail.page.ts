import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { ChipModule } from 'primeng/chip';
import { MessageService } from 'primeng/api';
import { KnowledgeService } from '../knowledge.service';
import { KnowledgeDocument } from '../knowledge.model';

@Component({
  selector: 'app-knowledge-detail',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, DividerModule, SkeletonModule, ToastModule, ChipModule],
  providers: [MessageService],
  template: `
    <div class="knowledge-detail-page">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-content-between align-items-center p-3">
            <h2>Detalle del Documento</h2>
            <div class="flex gap-2">
              <p-button label="Procesar" icon="pi pi-refresh" severity="help" (onClick)="processDocument()" [disabled]="!document || document.status === 'processing'"></p-button>
              <p-button label="Editar" icon="pi pi-pencil" (onClick)="goToEdit()" [disabled]="!document"></p-button>
              <p-button label="Volver" icon="pi pi-arrow-left" severity="secondary" (onClick)="goBack()"></p-button>
            </div>
          </div>
        </ng-template>

        <div *ngIf="loading" class="loading-skeleton">
          <p-skeleton height="2rem" styleClass="mb-3"></p-skeleton>
          <p-skeleton height="1.5rem" styleClass="mb-2"></p-skeleton>
          <p-skeleton height="1.5rem" styleClass="mb-2"></p-skeleton>
          <p-skeleton height="1.5rem" styleClass="mb-2"></p-skeleton>
        </div>

        <div *ngIf="!loading && document" class="document-details">
          <div class="detail-section">
            <h3>Información General</h3>
            <p-divider></p-divider>

            <div class="detail-grid">
              <div class="detail-item">
                <label>Título:</label>
                <span class="value">{{ document.title }}</span>
              </div>

              <div class="detail-item">
                <label>Tipo:</label>
                <span class="badge badge-type">{{ getTypeLabel(document.type) }}</span>
              </div>

              <div class="detail-item">
                <label>Estado:</label>
                <span [class]="'badge badge-status-' + document.status">
                  {{ getStatusLabel(document.status) }}
                </span>
              </div>

              <div class="detail-item">
                <label>Origen:</label>
                <span class="value">{{ getSourceTypeLabel(document.sourceType) }}</span>
              </div>

              <div class="detail-item" *ngIf="document.fileName">
                <label>Archivo:</label>
                <span class="value">{{ document.fileName }}</span>
              </div>

              <div class="detail-item" *ngIf="document.fileSize">
                <label>Tamaño:</label>
                <span class="value">{{ formatFileSize(document.fileSize) }}</span>
              </div>

              <div class="detail-item" *ngIf="document.mimeType">
                <label>Tipo MIME:</label>
                <span class="value">{{ document.mimeType }}</span>
              </div>

              <div class="detail-item" *ngIf="document.sourceUrl">
                <label>URL Origen:</label>
                <span class="value">
                  <a [href]="document.sourceUrl" target="_blank" class="link">{{ document.sourceUrl }}</a>
                </span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Procesamiento</h3>
            <p-divider></p-divider>

            <div class="detail-grid">
              <div class="detail-item">
                <label>Chunks Generados:</label>
                <span class="value font-semibold">{{ document.chunksCount || 0 }}</span>
              </div>

              <div class="detail-item" *ngIf="document.processedAt">
                <label>Procesado:</label>
                <span class="value">{{ document.processedAt | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>

              <div class="detail-item full-width" *ngIf="document.errorMessage">
                <label>Error:</label>
                <span class="value text-danger">{{ document.errorMessage }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section" *ngIf="document.content">
            <h3>Contenido</h3>
            <p-divider></p-divider>

            <div class="content-box">
              {{ document.content }}
            </div>
          </div>

          <div class="detail-section" *ngIf="document.tags && document.tags.length > 0">
            <h3>Tags</h3>
            <p-divider></p-divider>

            <div class="tags-container">
              <p-chip *ngFor="let tag of document.tags" [label]="tag"></p-chip>
            </div>
          </div>

          <div class="detail-section">
            <h3>Metadatos</h3>
            <p-divider></p-divider>

            <div class="detail-grid">
              <div class="detail-item">
                <label>Creado:</label>
                <span class="value">{{ document.createdAt | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>

              <div class="detail-item">
                <label>Última actualización:</label>
                <span class="value">{{ document.updatedAt | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>

              <div class="detail-item">
                <label>ID:</label>
                <span class="value text-sm text-gray-500">{{ document.id }}</span>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="!loading && !document" class="text-center p-5">
          <i class="pi pi-exclamation-circle text-4xl text-red-500 mb-3"></i>
          <p>Documento no encontrado</p>
        </div>
      </p-card>

      <p-toast></p-toast>
    </div>
  `,
  styles: [
    `
      .knowledge-detail-page {
        padding: 1.5rem;
      }

      .detail-section {
        margin-bottom: 2rem;
      }

      .detail-section h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.25rem;
        font-weight: 600;
      }

      .detail-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-top: 1rem;
      }

      .detail-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .detail-item.full-width {
        grid-column: 1 / -1;
      }

      .detail-item label {
        font-weight: 600;
        color: #6c757d;
        font-size: 0.875rem;
        text-transform: uppercase;
      }

      .detail-item .value {
        font-size: 1rem;
        color: #212529;
      }

      .badge {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.875rem;
        font-weight: 600;
      }

      .badge-type {
        background-color: #d1ecf1;
        color: #0c5460;
      }

      .badge-status-pending {
        background-color: #e2e3e5;
        color: #383d41;
      }

      .badge-status-processing {
        background-color: #fff3cd;
        color: #856404;
      }

      .badge-status-completed {
        background-color: #d4edda;
        color: #155724;
      }

      .badge-status-failed {
        background-color: #f8d7da;
        color: #721c24;
      }

      .content-box {
        background-color: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        padding: 1rem;
        margin-top: 1rem;
        max-height: 400px;
        overflow-y: auto;
        white-space: pre-wrap;
        font-family: monospace;
        font-size: 0.875rem;
      }

      .tags-container {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 1rem;
      }

      .link {
        color: #007bff;
        text-decoration: none;
        word-break: break-all;
      }

      .link:hover {
        text-decoration: underline;
      }

      .text-danger {
        color: #dc3545;
      }
    `,
  ],
})
export class KnowledgeDetailPage implements OnInit {
  private knowledgeService = inject(KnowledgeService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  document: KnowledgeDocument | null = null;
  loading = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDocument(id);
    }
  }

  loadDocument(id: string): void {
    this.loading = true;
    this.knowledgeService.findOne(id).subscribe({
      next: (document) => {
        this.document = document;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el documento',
        });
        this.loading = false;
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

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      processing: 'Procesando',
      completed: 'Completado',
      failed: 'Fallido',
    };
    return labels[status] || status;
  }

  getSourceTypeLabel(sourceType?: string): string {
    if (!sourceType) return '-';
    const labels: Record<string, string> = {
      file: 'Archivo',
      url: 'URL',
      manual: 'Manual',
      api: 'API',
    };
    return labels[sourceType] || sourceType;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  processDocument(): void {
    if (this.document) {
      this.knowledgeService.process(this.document.id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Documento enviado a procesar',
          });
          this.loadDocument(this.document!.id);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al procesar documento',
          });
        },
      });
    }
  }

  goToEdit(): void {
    if (this.document) {
      this.router.navigate(['/knowledge', this.document.id, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/knowledge']);
  }
}
