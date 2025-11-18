import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { KnowledgeService } from '../knowledge.service';
import { KnowledgeDocument } from '../knowledge.model';

@Component({
  selector: 'app-knowledge-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="knowledge-list-page">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-content-between align-items-center p-3">
            <h2>Gestión de Base de Conocimiento</h2>
            <p-button
              label="Nuevo Documento"
              icon="pi pi-plus"
              (onClick)="goToCreate()"
            ></p-button>
          </div>
        </ng-template>

        <p-table
          [value]="documents"
          [loading]="loading"
          [paginator]="true"
          [rows]="10"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} documentos"
          [rowsPerPageOptions]="[10, 25, 50]"
          [globalFilterFields]="['title', 'type', 'fileName']"
          #dt
        >
          <ng-template pTemplate="caption">
            <div class="flex">
              <span class="p-input-icon-left ml-auto">
                <i class="pi pi-search"></i>
                <input
                  pInputText
                  type="text"
                  (input)="dt.filterGlobal($any($event.target).value, 'contains')"
                  placeholder="Buscar..."
                />
              </span>
            </div>
          </ng-template>

          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="title">
                Título <p-sortIcon field="title"></p-sortIcon>
              </th>
              <th pSortableColumn="type">
                Tipo <p-sortIcon field="type"></p-sortIcon>
              </th>
              <th>Archivo</th>
              <th>Chunks</th>
              <th pSortableColumn="status">
                Estado <p-sortIcon field="status"></p-sortIcon>
              </th>
              <th>Acciones</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-document>
            <tr>
              <td>{{ document.title }}</td>
              <td>
                <span class="badge badge-type">{{ getTypeLabel(document.type) }}</span>
              </td>
              <td>{{ document.fileName || '-' }}</td>
              <td>{{ document.chunksCount || 0 }}</td>
              <td>
                <span [class]="'badge badge-status-' + document.status">
                  {{ getStatusLabel(document.status) }}
                </span>
              </td>
              <td>
                <div class="flex gap-2">
                  <p-button
                    icon="pi pi-eye"
                    [rounded]="true"
                    [text]="true"
                    severity="info"
                    (onClick)="goToDetail(document.id)"
                    pTooltip="Ver detalle"
                  ></p-button>
                  <p-button
                    icon="pi pi-pencil"
                    [rounded]="true"
                    [text]="true"
                    severity="warning"
                    (onClick)="goToEdit(document.id)"
                    pTooltip="Editar"
                  ></p-button>
                  <p-button
                    icon="pi pi-refresh"
                    [rounded]="true"
                    [text]="true"
                    severity="help"
                    (onClick)="processDocument(document)"
                    pTooltip="Procesar"
                    [disabled]="document.status === 'processing'"
                  ></p-button>
                  <p-button
                    icon="pi pi-trash"
                    [rounded]="true"
                    [text]="true"
                    severity="danger"
                    (onClick)="confirmDelete(document)"
                    pTooltip="Eliminar"
                  ></p-button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center">No se encontraron documentos.</td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>

      <p-confirmDialog></p-confirmDialog>
      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .knowledge-list-page {
      padding: 1.5rem;
    }

    .badge {
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
  `],
})
export class KnowledgeListPage implements OnInit {
  private knowledgeService = inject(KnowledgeService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  documents: KnowledgeDocument[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.loading = true;
    this.knowledgeService.findAll().subscribe({
      next: (documents) => {
        this.documents = documents;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar documentos',
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

  goToCreate(): void {
    this.router.navigate(['/knowledge/new']);
  }

  goToDetail(id: string): void {
    this.router.navigate(['/knowledge', id]);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/knowledge', id, 'edit']);
  }

  processDocument(document: KnowledgeDocument): void {
    this.knowledgeService.process(document.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Documento enviado a procesar',
        });
        this.loadDocuments();
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

  confirmDelete(document: KnowledgeDocument): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el documento "${document.title}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteDocument(document.id);
      },
    });
  }

  deleteDocument(id: string): void {
    this.knowledgeService.delete(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Documento eliminado correctamente',
        });
        this.loadDocuments();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al eliminar documento',
        });
      },
    });
  }
}
