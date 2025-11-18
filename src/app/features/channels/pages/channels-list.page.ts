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
import { ChannelsService } from '../channels.service';
import { Channel } from '../channel.model';

@Component({
  selector: 'app-channels-list',
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
    <div class="channels-list-page">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-content-between align-items-center p-3">
            <h2>Gestión de Canales</h2>
            <p-button
              label="Nuevo Canal"
              icon="pi pi-plus"
              (onClick)="goToCreate()"
            ></p-button>
          </div>
        </ng-template>

        <p-table
          [value]="channels"
          [loading]="loading"
          [paginator]="true"
          [rows]="10"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} canales"
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
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-channel>
            <tr>
              <td>{{ channel.name }}</td>
              <td>
                <span [class]="'badge badge-' + channel.type">
                  {{ getChannelTypeLabel(channel.type) }}
                </span>
              </td>
              <td>{{ channel.description || '-' }}</td>
              <td>
                <span
                  [class]="
                    'badge ' + (channel.isActive ? 'badge-success' : 'badge-danger')
                  "
                >
                  {{ channel.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td>
                <div class="flex gap-2">
                  <p-button
                    icon="pi pi-eye"
                    [rounded]="true"
                    [text]="true"
                    severity="info"
                    (onClick)="goToDetail(channel.id)"
                    pTooltip="Ver detalle"
                  ></p-button>
                  <p-button
                    icon="pi pi-pencil"
                    [rounded]="true"
                    [text]="true"
                    severity="warn"
                    (onClick)="goToEdit(channel.id)"
                    pTooltip="Editar"
                  ></p-button>
                  <p-button
                    icon="pi pi-trash"
                    [rounded]="true"
                    [text]="true"
                    severity="danger"
                    (onClick)="confirmDelete(channel)"
                    pTooltip="Eliminar"
                  ></p-button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="5" class="text-center">No se encontraron canales.</td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>

      <p-confirmDialog></p-confirmDialog>
      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .channels-list-page {
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

    .badge-telegram {
      background-color: #d1ecf1;
      color: #0c5460;
    }

    .badge-whatsapp {
      background-color: #d4edda;
      color: #155724;
    }

    .badge-instagram {
      background-color: #f8d7da;
      color: #721c24;
    }

    .badge-webchat {
      background-color: #fff3cd;
      color: #856404;
    }

    .badge-api {
      background-color: #e2e3e5;
      color: #383d41;
    }
  `],
})
export class ChannelsListPage implements OnInit {
  private channelsService = inject(ChannelsService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  channels: Channel[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadChannels();
  }

  loadChannels(): void {
    this.loading = true;
    this.channelsService.findAll().subscribe({
      next: (channels) => {
        this.channels = channels;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar canales',
        });
        this.loading = false;
      },
    });
  }

  getChannelTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      telegram: 'Telegram',
      whatsapp: 'WhatsApp',
      instagram: 'Instagram',
      webchat: 'Web Chat',
      api: 'API',
    };
    return labels[type] || type;
  }

  goToCreate(): void {
    this.router.navigate(['/channels/new']);
  }

  goToDetail(id: string): void {
    this.router.navigate(['/channels', id]);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/channels', id, 'edit']);
  }

  confirmDelete(channel: Channel): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el canal "${channel.name}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteChannel(channel.id);
      },
    });
  }

  deleteChannel(id: string): void {
    this.channelsService.delete(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Canal eliminado correctamente',
        });
        this.loadChannels();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al eliminar canal',
        });
      },
    });
  }
}
