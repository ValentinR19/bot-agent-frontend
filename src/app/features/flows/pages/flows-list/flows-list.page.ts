import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

import { FlowsService } from '../../flows.service';
import { Flow } from '../../flows.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { CustomTableComponent, TableColumn, TableAction } from '../../../../shared/components/custom-table/custom-table.component';
import { FilterPanelComponent } from '../../../../shared/components/filter-panel/filter-panel.component';

@Component({
  selector: 'app-flows-list',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, CustomTableComponent, FilterPanelComponent, ButtonModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './flows-list.page.html',
  styleUrl: './flows-list.page.scss',
})
export class FlowsListPage implements OnInit {
  private readonly flowsService = inject(FlowsService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

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

  loadFlows(): void {
    this.loading = true;
    this.flowsService.findAll().subscribe({
      next: (flows) => {
        this.flows = flows;
        this.loading = false;
      },
      error: (error) => {
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
    // TODO: Implementar búsqueda en el backend o filtrar localmente
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
        this.flowsService.delete(flow.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Flujo eliminado correctamente',
            });
            this.loadFlows();
          },
          error: (error) => {
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
