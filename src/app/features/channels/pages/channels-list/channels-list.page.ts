import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

import { ChannelsService } from '../../channels.service';
import { Channel } from '../../channels.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { CustomTableComponent, TableColumn, TableAction } from '../../../../shared/components/custom-table/custom-table.component';
import { FilterPanelComponent } from '../../../../shared/components/filter-panel/filter-panel.component';

@Component({
  selector: 'app-channels-list',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    CustomTableComponent,
    FilterPanelComponent,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './channels-list.page.html',
  styleUrl: './channels-list.page.scss'
})
export class ChannelsListPage implements OnInit {
  private readonly channelsService = inject(ChannelsService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  channels: Channel[] = [];
  loading = false;
  searchText = '';

  columns: TableColumn[] = [
    { field: 'name', header: 'Nombre', sortable: true, filterable: true },
    { field: 'type', header: 'Tipo', sortable: true, filterable: true },
    { field: 'status', header: 'Estado', sortable: true },
    { field: 'isActive', header: 'Activo', sortable: true, type: 'boolean' },
    { field: 'lastSyncAt', header: 'Última Sincronización', sortable: true, type: 'date' },
    { field: 'createdAt', header: 'Fecha de Creación', sortable: true, type: 'date' }
  ];

  actions: TableAction[] = [
    {
      label: 'Ver',
      icon: 'pi pi-eye',
      severity: 'info',
      command: (channel: Channel) => this.viewChannel(channel)
    },
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      severity: 'primary',
      command: (channel: Channel) => this.editChannel(channel)
    },
    {
      label: 'Eliminar',
      icon: 'pi pi-trash',
      severity: 'danger',
      command: (channel: Channel) => this.deleteChannel(channel)
    }
  ];

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
          detail: 'No se pudieron cargar los canales'
        });
        this.loading = false;
      }
    });
  }

  onSearch(searchText: string): void {
    this.searchText = searchText;
    // TODO: Implementar búsqueda en el backend o filtrar localmente
  }

  createChannel(): void {
    this.router.navigate(['/channels/new']);
  }

  viewChannel(channel: Channel): void {
    this.router.navigate(['/channels', channel.id]);
  }

  editChannel(channel: Channel): void {
    this.router.navigate(['/channels', channel.id, 'edit']);
  }

  deleteChannel(channel: Channel): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar el canal "${channel.name}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.channelsService.delete(channel.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Canal eliminado correctamente'
            });
            this.loadChannels();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar el canal'
            });
          }
        });
      }
    });
  }
}
