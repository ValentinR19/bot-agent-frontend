import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { Select } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
import { Tag } from 'primeng/tag';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CustomTableComponent, TableAction, TableColumn } from '../../../../shared/components/custom-table/custom-table.component';
import { FilterPanelComponent } from '../../../../shared/components/filter-panel/filter-panel.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { KnowledgeDocument, DocumentType, DocumentStatus } from '../../models/knowledge.model';
import { KnowledgeService } from '../../services/knowledge.service';
import { UploadDocumentDialogComponent } from '../../components/upload-document-dialog/upload-document-dialog.component';
import { ProcessingStatusComponent } from '../../components/processing-status/processing-status.component';

@Component({
  selector: 'app-knowledge-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    CustomTableComponent,
    FilterPanelComponent,
    Button,
    ToastModule,
    ConfirmDialog,
    Select,
    MultiSelect,
    Tag,
    UploadDocumentDialogComponent,
    ProcessingStatusComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './knowledge-list.component.html',
  styleUrl: './knowledge-list.component.scss',
})
export class KnowledgeListComponent implements OnInit, OnDestroy {
  private readonly knowledgeService = inject(KnowledgeService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly destroy$ = new Subject<void>();

  documents: KnowledgeDocument[] = [];
  loading = false;
  searchText = '';
  uploadDialogVisible = false;

  // Filtros
  selectedType: DocumentType | null = null;
  selectedStatus: DocumentStatus | null = null;
  selectedTags: string[] = [];
  availableTags: string[] = [];

  documentTypes = [
    { label: 'FAQ', value: 'faq' as DocumentType },
    { label: 'Catálogo de Productos', value: 'product_catalog' as DocumentType },
    { label: 'Manual', value: 'manual' as DocumentType },
    { label: 'Política', value: 'policy' as DocumentType },
    { label: 'General', value: 'general' as DocumentType },
  ];

  statuses = [
    { label: 'Pendiente', value: 'pending' as DocumentStatus },
    { label: 'Procesando', value: 'processing' as DocumentStatus },
    { label: 'Completado', value: 'completed' as DocumentStatus },
    { label: 'Error', value: 'failed' as DocumentStatus },
  ];

  columns: TableColumn[] = [
    { field: 'title', header: 'Título', sortable: true, filterable: true },
    { field: 'type', header: 'Tipo', sortable: true, filterable: true },
    { field: 'status', header: 'Estado', sortable: true },
    { field: 'chunksCount', header: 'Chunks', sortable: true },
    { field: 'tags', header: 'Tags', sortable: false },
    { field: 'createdAt', header: 'Fecha de Creación', sortable: true, type: 'date' },
  ];

  actions: TableAction[] = [
    {
      label: 'Ver',
      icon: 'pi pi-eye',
      severity: 'info',
      command: (document: KnowledgeDocument) => this.viewDocument(document),
    },
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      severity: 'primary',
      command: (document: KnowledgeDocument) => this.editDocument(document),
    },
    {
      label: 'Reprocesar',
      icon: 'pi pi-refresh',
      severity: 'warn',
      command: (document: KnowledgeDocument) => this.reprocessDocument(document),
      visible: (document: KnowledgeDocument) => document.status === 'failed',
    },
    {
      label: 'Eliminar',
      icon: 'pi pi-trash',
      severity: 'danger',
      command: (document: KnowledgeDocument) => this.deleteDocument(document),
    },
  ];

  ngOnInit(): void {
    this.loadDocuments();
    this.extractAvailableTags();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDocuments(): void {
    this.loading = true;

    // Aplicar filtros si existen
    let observable;
    if (this.selectedType) {
      observable = this.knowledgeService.findByType(this.selectedType);
    } else if (this.selectedStatus) {
      observable = this.knowledgeService.findByStatus(this.selectedStatus);
    } else if (this.selectedTags.length > 0) {
      observable = this.knowledgeService.search({ tags: this.selectedTags });
    } else {
      observable = this.knowledgeService.findAll();
    }

    observable.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.documents = response.data;
        this.extractAvailableTags();
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los documentos',
        });
        this.loading = false;
      },
    });
  }

  extractAvailableTags(): void {
    const tagsSet = new Set<string>();
    this.documents.forEach((doc) => {
      if (doc.tags && Array.isArray(doc.tags)) {
        doc.tags.forEach((tag) => tagsSet.add(tag));
      }
    });
    this.availableTags = Array.from(tagsSet).sort();
  }

  applyFilters(): void {
    this.loadDocuments();
  }

  clearFilters(): void {
    this.selectedType = null;
    this.selectedStatus = null;
    this.selectedTags = [];
    this.loadDocuments();
  }

  onSearch(searchText: string): void {
    this.searchText = searchText;
    // TODO: Implementar búsqueda en el backend o filtrar localmente
  }

  openUploadDialog(): void {
    this.uploadDialogVisible = true;
  }

  onDocumentUploaded(document: KnowledgeDocument): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Documento agregado',
      detail: `"${document.title}" se está procesando`,
    });
    this.loadDocuments();
  }

  createDocument(): void {
    this.router.navigate(['/knowledge/new']);
  }

  reprocessDocument(document: KnowledgeDocument): void {
    this.confirmationService.confirm({
      message: `¿Desea reprocesar el documento "${document.title}"?`,
      header: 'Confirmar Reprocesamiento',
      icon: 'pi pi-refresh',
      acceptLabel: 'Sí, reprocesar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.knowledgeService
          .process(document.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'info',
                summary: 'Procesando',
                detail: 'El documento se está reprocesando',
              });
              this.loadDocuments();
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo reprocesar el documento',
              });
            },
          });
      },
    });
  }

  getTypeSeverity(type: DocumentType): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const severities: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      faq: 'info',
      product_catalog: 'success',
      manual: 'warn',
      policy: 'danger',
      general: 'secondary',
    };
    return severities[type] || 'secondary';
  }

  viewDocument(document: KnowledgeDocument): void {
    this.router.navigate(['/knowledge', document.id]);
  }

  editDocument(document: KnowledgeDocument): void {
    this.router.navigate(['/knowledge', document.id, 'edit']);
  }

  deleteDocument(document: KnowledgeDocument): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar el documento "${document.title}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.knowledgeService
          .delete(document.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
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
                detail: 'No se pudo eliminar el documento',
              });
            },
          });
      },
    });
  }
}
