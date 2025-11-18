import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

import { CatalogService } from '../../catalog.service';
import { CatalogItem } from '../../catalog.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { CustomTableComponent, TableColumn, TableAction } from '../../../../shared/components/custom-table/custom-table.component';
import { FilterPanelComponent } from '../../../../shared/components/filter-panel/filter-panel.component';

@Component({
  selector: 'app-catalog-list',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, CustomTableComponent, FilterPanelComponent, ButtonModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './catalog-list.page.html',
  styleUrl: './catalog-list.page.scss',
})
export class CatalogListPage implements OnInit {
  private readonly catalogService = inject(CatalogService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  catalogItems: CatalogItem[] = [];
  loading = false;
  searchText = '';

  columns: TableColumn[] = [
    { field: 'name', header: 'Nombre', sortable: true, filterable: true },
    { field: 'sku', header: 'SKU', sortable: true, filterable: true },
    { field: 'type', header: 'Tipo', sortable: true },
    { field: 'price', header: 'Precio', sortable: true },
    { field: 'stock', header: 'Stock', sortable: true },
    { field: 'isActive', header: 'Activo', sortable: true, type: 'boolean' },
    { field: 'isFeatured', header: 'Destacado', sortable: true, type: 'boolean' },
    { field: 'createdAt', header: 'Fecha de Creación', sortable: true, type: 'date' },
  ];

  actions: TableAction[] = [
    {
      label: 'Ver',
      icon: 'pi pi-eye',
      severity: 'info',
      command: (item: CatalogItem) => this.viewItem(item),
    },
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      severity: 'primary',
      command: (item: CatalogItem) => this.editItem(item),
    },
    {
      label: 'Eliminar',
      icon: 'pi pi-trash',
      severity: 'danger',
      command: (item: CatalogItem) => this.deleteItem(item),
    },
  ];

  ngOnInit(): void {
    this.loadCatalogItems();
  }

  loadCatalogItems(): void {
    this.loading = true;
    this.catalogService.findAll().subscribe({
      next: (items) => {
        this.catalogItems = items;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los items del catálogo',
        });
        this.loading = false;
      },
    });
  }

  onSearch(searchText: string): void {
    this.searchText = searchText;
    // TODO: Implementar búsqueda en el backend o filtrar localmente
  }

  createItem(): void {
    this.router.navigate(['/catalog/new']);
  }

  viewItem(item: CatalogItem): void {
    this.router.navigate(['/catalog', item.id]);
  }

  editItem(item: CatalogItem): void {
    this.router.navigate(['/catalog', item.id, 'edit']);
  }

  deleteItem(item: CatalogItem): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar el item "${item.name}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.catalogService.delete(item.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Item eliminado correctamente',
            });
            this.loadCatalogItems();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar el item',
            });
          },
        });
      },
    });
  }
}
