import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { KnowledgeService } from '../../services/knowledge.service';
import { KnowledgeDocument } from '../../models/knowledge.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { CustomTableComponent, TableColumn, TableAction } from '../../../../shared/components/custom-table/custom-table.component';
import { FilterPanelComponent } from '../../../../shared/components/filter-panel/filter-panel.component';

@Component({
  selector: 'app-knowledge-list',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, CustomTableComponent, FilterPanelComponent, ButtonModule, ToastModule, ConfirmDialogModule],
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

  columns: TableColumn[] = [
    { field: 'title', header: 'Título', sortable: true, filterable: true },
    { field: 'type', header: 'Tipo', sortable: true, filterable: true },
    { field: 'status', header: 'Estado', sortable: true },
    { field: 'fileSize', header: 'Tamaño', sortable: true },
    { field: 'processingCompletedAt', header: 'Procesado', sortable: true, type: 'date' },
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
      label: 'Eliminar',
      icon: 'pi pi-trash',
      severity: 'danger',
      command: (document: KnowledgeDocument) => this.deleteDocument(document),
    },
  ];

  ngOnInit(): void {
    this.loadDocuments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDocuments(): void {
    this.loading = true;
    this.knowledgeService
      .findAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (documents) => {
          this.documents = documents;
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

  onSearch(searchText: string): void {
    this.searchText = searchText;
    // TODO: Implementar búsqueda en el backend o filtrar localmente
  }

  createDocument(): void {
    this.router.navigate(['/knowledge/new']);
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
