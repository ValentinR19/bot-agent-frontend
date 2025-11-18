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
import { CatalogService } from '../catalog.service';
import { CatalogItem } from '../catalog.model';

@Component({
  selector: 'app-catalog-list',
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
    <div class="catalog-list-page">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-content-between align-items-center p-3">
            <h2>Gestión de Catálogo</h2>
            <p-button
              label="Nuevo Item"
              icon="pi pi-plus"
              (onClick)="goToCreate()"
            ></p-button>
          </div>
        </ng-template>

        <p-table
          [value]="items"
          [loading]="loading"
          [paginator]="true"
          [rows]="10"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} items"
          [rowsPerPageOptions]="[10, 25, 50]"
          [globalFilterFields]="['title', 'sku', 'type']"
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
              <th>SKU</th>
              <th pSortableColumn="type">
                Tipo <p-sortIcon field="type"></p-sortIcon>
              </th>
              <th pSortableColumn="price">
                Precio <p-sortIcon field="price"></p-sortIcon>
              </th>
              <th>Stock</th>
              <th>Destacado</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-item>
            <tr>
              <td>{{ item.title }}</td>
              <td>
                <span class="font-semibold">{{ item.sku || '-' }}</span>
              </td>
              <td>
                <span class="badge badge-type">{{ getTypeLabel(item.type) }}</span>
              </td>
              <td>{{ item.price ? (item.price | number: '1.2-2') + ' ' + item.currency : '-' }}</td>
              <td>{{ item.stock !== undefined ? item.stock : '-' }}</td>
              <td>
                <span
                  [class]="
                    'badge ' + (item.isFeatured ? 'badge-warning' : 'badge-secondary')
                  "
                >
                  {{ item.isFeatured ? 'Sí' : 'No' }}
                </span>
              </td>
              <td>
                <span
                  [class]="
                    'badge ' + (item.isActive ? 'badge-success' : 'badge-danger')
                  "
                >
                  {{ item.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td>
                <div class="flex gap-2">
                  <p-button
                    icon="pi pi-eye"
                    [rounded]="true"
                    [text]="true"
                    severity="info"
                    (onClick)="goToDetail(item.id)"
                    pTooltip="Ver detalle"
                  ></p-button>
                  <p-button
                    icon="pi pi-pencil"
                    [rounded]="true"
                    [text]="true"
                    severity="warn"
                    (onClick)="goToEdit(item.id)"
                    pTooltip="Editar"
                  ></p-button>
                  <p-button
                    icon="pi pi-trash"
                    [rounded]="true"
                    [text]="true"
                    severity="danger"
                    (onClick)="confirmDelete(item)"
                    pTooltip="Eliminar"
                  ></p-button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="8" class="text-center">No se encontraron items en el catálogo.</td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>

      <p-confirmDialog></p-confirmDialog>
      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .catalog-list-page {
      padding: 1.5rem;
    }

    .badge {
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .badge-success {
      background-color: #d4edda;
      color: #155724;
    }

    .badge-danger {
      background-color: #f8d7da;
      color: #721c24;
    }

    .badge-warning {
      background-color: #fff3cd;
      color: #856404;
    }

    .badge-secondary {
      background-color: #e2e3e5;
      color: #383d41;
    }

    .badge-type {
      background-color: #d1ecf1;
      color: #0c5460;
    }
  `],
})
export class CatalogListPage implements OnInit {
  private catalogService = inject(CatalogService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  items: CatalogItem[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {
    this.loading = true;
    this.catalogService.findAll().subscribe({
      next: (items) => {
        this.items = items;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar items del catálogo',
        });
        this.loading = false;
      },
    });
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      product: 'Producto',
      service: 'Servicio',
      property: 'Propiedad',
      course: 'Curso',
      vehicle: 'Vehículo',
      plan: 'Plan',
      custom: 'Personalizado',
    };
    return labels[type] || type;
  }

  goToCreate(): void {
    this.router.navigate(['/catalog/new']);
  }

  goToDetail(id: string): void {
    this.router.navigate(['/catalog', id]);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/catalog', id, 'edit']);
  }

  confirmDelete(item: CatalogItem): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el item "${item.title}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteItem(item.id);
      },
    });
  }

  deleteItem(id: string): void {
    this.catalogService.delete(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Item eliminado correctamente',
        });
        this.loadItems();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al eliminar item',
        });
      },
    });
  }
}
