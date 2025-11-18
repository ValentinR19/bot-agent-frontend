import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DestinationsService } from '../destinations.service';
import { Destination } from '../destination.model';

@Component({
  selector: 'app-destinations-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    TagModule,
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="destinations-list-page">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-content-between align-items-center p-3">
            <h2>Gestión de Destinos</h2>
            <p-button
              label="Nuevo Destino"
              icon="pi pi-plus"
              (onClick)="goToCreate()"
            ></p-button>
          </div>
        </ng-template>

        <p-table
          [value]="destinations"
          [loading]="loading"
          [paginator]="true"
          [rows]="10"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} destinos"
          [rowsPerPageOptions]="[10, 25, 50]"
          [globalFilterFields]="['name', 'type', 'description']"
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
              <th pSortableColumn="name">
                Nombre <p-sortIcon field="name"></p-sortIcon>
              </th>
              <th pSortableColumn="type">
                Tipo <p-sortIcon field="type"></p-sortIcon>
              </th>
              <th>Descripción</th>
              <th pSortableColumn="isActive">
                Estado <p-sortIcon field="isActive"></p-sortIcon>
              </th>
              <th>Llamadas</th>
              <th>Errores</th>
              <th pSortableColumn="lastUsedAt">
                Último Uso <p-sortIcon field="lastUsedAt"></p-sortIcon>
              </th>
              <th>Acciones</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-destination>
            <tr>
              <td>{{ destination.name }}</td>
              <td>
                <p-tag [value]="getTypeLabel(destination.type)" severity="info"></p-tag>
              </td>
              <td>
                <span class="text-gray-600">{{ destination.description || '-' }}</span>
              </td>
              <td>
                <p-tag
                  [value]="destination.isActive ? 'Activo' : 'Inactivo'"
                  [severity]="destination.isActive ? 'success' : 'danger'"
                ></p-tag>
              </td>
              <td>
                <span class="badge badge-info">{{ destination.totalCalls }}</span>
              </td>
              <td>
                <span
                  class="badge"
                  [class.badge-danger]="destination.totalErrors > 0"
                  [class.badge-success]="destination.totalErrors === 0"
                >
                  {{ destination.totalErrors }}
                </span>
              </td>
              <td>
                {{ destination.lastUsedAt ? (destination.lastUsedAt | date: 'dd/MM/yyyy HH:mm') : 'Nunca' }}
              </td>
              <td>
                <div class="flex gap-2">
                  <p-button
                    icon="pi pi-eye"
                    [rounded]="true"
                    [text]="true"
                    severity="info"
                    (onClick)="goToDetail(destination.id)"
                    pTooltip="Ver detalle"
                  ></p-button>
                  <p-button
                    icon="pi pi-pencil"
                    [rounded]="true"
                    [text]="true"
                    severity="warning"
                    (onClick)="goToEdit(destination.id)"
                    pTooltip="Editar"
                  ></p-button>
                  <p-button
                    icon="pi pi-trash"
                    [rounded]="true"
                    [text]="true"
                    severity="danger"
                    (onClick)="confirmDelete(destination)"
                    pTooltip="Eliminar"
                  ></p-button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="8" class="text-center">No se encontraron destinos.</td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>

      <p-confirmDialog></p-confirmDialog>
      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .destinations-list-page {
      padding: 1.5rem;
    }

    .badge {
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .badge-info {
      background-color: #d1ecf1;
      color: #0c5460;
    }

    .badge-success {
      background-color: #d4edda;
      color: #155724;
    }

    .badge-danger {
      background-color: #f8d7da;
      color: #721c24;
    }
  `],
})
export class DestinationsListPage implements OnInit {
  private destinationsService = inject(DestinationsService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  destinations: Destination[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadDestinations();
  }

  loadDestinations(): void {
    this.loading = true;
    this.destinationsService.getDestinations().subscribe({
      next: (destinations) => {
        this.destinations = destinations;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar destinos',
        });
        this.loading = false;
      },
    });
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      email: 'Email',
      webhook: 'Webhook',
      api: 'API',
      crm: 'CRM',
      erp: 'ERP',
      slack: 'Slack',
      whatsapp_business: 'WhatsApp Business',
      zapier: 'Zapier',
      make: 'Make',
      custom: 'Personalizado',
    };
    return labels[type] || type;
  }

  goToCreate(): void {
    this.router.navigate(['/destinations/new']);
  }

  goToDetail(id: string): void {
    this.router.navigate(['/destinations', id]);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/destinations', id, 'edit']);
  }

  confirmDelete(destination: Destination): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el destino "${destination.name}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteDestination(destination.id);
      },
    });
  }

  deleteDestination(id: string): void {
    this.destinationsService.deleteDestination(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Destino eliminado correctamente',
        });
        this.loadDestinations();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al eliminar destino',
        });
      },
    });
  }
}
