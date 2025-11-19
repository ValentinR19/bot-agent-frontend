import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { ChannelsService } from '../../services/channels.service';
import { Channel } from '../../models/channel.model';
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
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './channels-list.component.html',
  styleUrl: './channels-list.component.scss',
})
export class ChannelsListComponent implements OnInit, OnDestroy {
  private readonly channelsService = inject(ChannelsService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly destroy$ = new Subject<void>();

  channels: Channel[] = [];
  loading = false;
  searchText = '';

  columns: TableColumn[] = [
    { field: 'name', header: 'Nombre', sortable: true, filterable: true },
    { field: 'type', header: 'Tipo', sortable: true, filterable: true },
    { field: 'status', header: 'Estado', sortable: true },
    { field: 'isActive', header: 'Activo', sortable: true, type: 'boolean' },
    { field: 'lastSyncAt', header: 'Última Sincronización', sortable: true, type: 'date' },
    { field: 'createdAt', header: 'Fecha de Creación', sortable: true, type: 'date' },
  ];

  actions: TableAction[] = [
    {
      label: 'Ver',
      icon: 'pi pi-eye',
      severity: 'info',
      command: (channel: Channel) => this.viewChannel(channel),
    },
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      severity: 'primary',
      command: (channel: Channel) => this.editChannel(channel),
    },
    {
      label: 'Eliminar',
      icon: 'pi pi-trash',
      severity: 'danger',
      command: (channel: Channel) => this.deleteChannel(channel),
    },
  ];

  ngOnInit(): void {
    this.loadChannels();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadChannels(): void {
    this.loading = true;
    this.channelsService
      .findAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (channels) => {
          this.channels = channels;
          this.loading = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los canales',
          });
          this.loading = false;
        },
      });
  }

  onSearch(searchText: string): void {
    this.searchText = searchText;
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
        this.channelsService
          .delete(channel.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Canal eliminado correctamente',
              });
              this.loadChannels();
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo eliminar el canal',
              });
            },
          });
      },
    });
  }
}
