import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Subject, takeUntil } from 'rxjs';

import { FlowsService } from '../../services/flows.service';
import { Flow } from '../../models/flow.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { CustomTableComponent, TableColumn, TableAction } from '../../../../shared/components/custom-table/custom-table.component';
import { FilterPanelComponent } from '../../../../shared/components/filter-panel/filter-panel.component';

@Component({
  selector: 'app-flows-list',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, CustomTableComponent, FilterPanelComponent, ButtonModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './flows-list.component.html',
  styleUrl: './flows-list.component.scss',
})
export class FlowsListComponent implements OnInit, OnDestroy {
  private readonly flowsService = inject(FlowsService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly destroy$ = new Subject<void>();

  flows: Flow[] = [];
  loading = false;
  searchText = '';

  columns: TableColumn[] = [
    { field: 'name', header: 'Nombre', sortable: true, filterable: true },
    { field: 'slug', header: 'Slug', sortable: true, filterable: true },
    { field: 'description', header: 'Descripción', sortable: true },
    { field: 'version', header: 'Versión', sortable: true },
    { field: 'isActive', header: 'Activo', sortable: true, type: 'boolean' },
    { field: 'isDefault', header: 'Por Defecto', sortable: true, type: 'boolean' },
    { field: 'createdAt', header: 'Fecha de Creación', sortable: true, type: 'date' },
  ];

  actions: TableAction[] = [
    {
      label: 'Ver',
      icon: 'pi pi-eye',
      severity: 'info',
      command: (flow: Flow) => this.viewFlow(flow),
    },
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      severity: 'primary',
      command: (flow: Flow) => this.editFlow(flow),
    },
    {
      label: 'Eliminar',
      icon: 'pi pi-trash',
      severity: 'danger',
      command: (flow: Flow) => this.deleteFlow(flow),
    },
  ];

  ngOnInit(): void {
    this.loadFlows();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadFlows(): void {
    this.loading = true;
    this.flowsService
      .findAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (flows) => {
          this.flows = flows;
          this.loading = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los flujos',
          });
          this.loading = false;
        },
      });
  }

  onSearch(searchText: string): void {
    this.searchText = searchText;
  }

  createFlow(): void {
    this.router.navigate(['/flows/new']);
  }

  viewFlow(flow: Flow): void {
    this.router.navigate(['/flows', flow.id]);
  }

  editFlow(flow: Flow): void {
    this.router.navigate(['/flows', flow.id, 'edit']);
  }

  deleteFlow(flow: Flow): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar el flujo "${flow.name}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.flowsService
          .delete(flow.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Flujo eliminado correctamente',
              });
              this.loadFlows();
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo eliminar el flujo',
              });
            },
          });
      },
    });
  }
}
