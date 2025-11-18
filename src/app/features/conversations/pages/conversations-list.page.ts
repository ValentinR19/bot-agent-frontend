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
import { ConversationsService } from '../conversations.service';
import { Conversation, ConversationStatus } from '../conversations.model';

@Component({
  selector: 'app-conversations-list',
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
    <div class="conversations-list-page">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-content-between align-items-center p-3">
            <h2>Gestión de Conversaciones</h2>
            <p-button
              label="Nueva Conversación"
              icon="pi pi-plus"
              (onClick)="goToCreate()"
            ></p-button>
          </div>
        </ng-template>

        <p-table
          [value]="conversations"
          [loading]="loading"
          [paginator]="true"
          [rows]="10"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} conversaciones"
          [rowsPerPageOptions]="[10, 25, 50]"
          [globalFilterFields]="['externalUserId', 'status', 'channel.name']"
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
              <th pSortableColumn="externalUserId">
                Usuario <p-sortIcon field="externalUserId"></p-sortIcon>
              </th>
              <th>Canal</th>
              <th pSortableColumn="status">
                Estado <p-sortIcon field="status"></p-sortIcon>
              </th>
              <th pSortableColumn="lastMessageAt">
                Último Mensaje <p-sortIcon field="lastMessageAt"></p-sortIcon>
              </th>
              <th>Mensajes</th>
              <th>Acciones</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-conversation>
            <tr>
              <td>{{ conversation.externalUserId }}</td>
              <td>
                <span class="font-semibold">
                  {{ conversation.channel?.name || 'N/A' }}
                </span>
                <br />
                <small class="text-gray-500">{{ conversation.channel?.type || '' }}</small>
              </td>
              <td>
                <p-tag
                  [value]="getStatusLabel(conversation.status)"
                  [severity]="getStatusSeverity(conversation.status)"
                ></p-tag>
              </td>
              <td>
                {{ conversation.lastMessageAt ? (conversation.lastMessageAt | date: 'dd/MM/yyyy HH:mm') : '-' }}
              </td>
              <td>
                <span class="badge badge-info">
                  {{ conversation.messages?.length || 0 }}
                </span>
              </td>
              <td>
                <div class="flex gap-2">
                  <p-button
                    icon="pi pi-eye"
                    [rounded]="true"
                    [text]="true"
                    severity="info"
                    (onClick)="goToDetail(conversation.id)"
                    pTooltip="Ver detalle"
                  ></p-button>
                  <p-button
                    icon="pi pi-pencil"
                    [rounded]="true"
                    [text]="true"
                    severity="warn"
                    (onClick)="goToEdit(conversation.id)"
                    pTooltip="Editar"
                  ></p-button>
                  <p-button
                    icon="pi pi-trash"
                    [rounded]="true"
                    [text]="true"
                    severity="danger"
                    (onClick)="confirmDelete(conversation)"
                    pTooltip="Eliminar"
                  ></p-button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center">No se encontraron conversaciones.</td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>

      <p-confirmDialog></p-confirmDialog>
      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .conversations-list-page {
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
  `],
})
export class ConversationsListPage implements OnInit {
  private conversationsService = inject(ConversationsService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  conversations: Conversation[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadConversations();
  }

  loadConversations(): void {
    this.loading = true;
    this.conversationsService.findAll().subscribe({
      next: (conversations) => {
        this.conversations = conversations;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar conversaciones',
        });
        this.loading = false;
      },
    });
  }

  goToCreate(): void {
    this.router.navigate(['/conversations/new']);
  }

  goToDetail(id: string): void {
    this.router.navigate(['/conversations', id]);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/conversations', id, 'edit']);
  }

  confirmDelete(conversation: Conversation): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar la conversación con "${conversation.externalUserId}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteConversation(conversation.id);
      },
    });
  }

  deleteConversation(id: string): void {
    this.conversationsService.delete(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Conversación eliminada correctamente',
        });
        this.loadConversations();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al eliminar conversación',
        });
      },
    });
  }

  getStatusLabel(status: ConversationStatus): string {
    const labels: Record<ConversationStatus, string> = {
      [ConversationStatus.ACTIVE]: 'Activa',
      [ConversationStatus.WAITING]: 'En Espera',
      [ConversationStatus.COMPLETED]: 'Completada',
      [ConversationStatus.ABANDONED]: 'Abandonada',
      [ConversationStatus.ERROR]: 'Error',
    };
    return labels[status] || status;
  }

  getStatusSeverity(status: ConversationStatus): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    const severities: Record<ConversationStatus, 'success' | 'info' | 'warning' | 'danger' | 'secondary'> = {
      [ConversationStatus.ACTIVE]: 'success',
      [ConversationStatus.WAITING]: 'info',
      [ConversationStatus.COMPLETED]: 'secondary',
      [ConversationStatus.ABANDONED]: 'warning',
      [ConversationStatus.ERROR]: 'danger',
    };
    return severities[status] || 'info';
  }
}
