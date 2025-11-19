import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ConversationsService } from '../../services/conversations.service';
import { Conversation } from '../../models/conversations.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { CustomTableComponent, TableColumn, TableAction } from '../../../../shared/components/custom-table/custom-table.component';
import { FilterPanelComponent } from '../../../../shared/components/filter-panel/filter-panel.component';

@Component({
  selector: 'app-conversations-list',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, CustomTableComponent, FilterPanelComponent, ButtonModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './conversations-list.component.html',
  styleUrl: './conversations-list.component.scss',
})
export class ConversationsListComponent implements OnInit, OnDestroy {
  private readonly conversationsService = inject(ConversationsService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly destroy$ = new Subject<void>();

  conversations: Conversation[] = [];
  loading = false;
  searchText = '';

  columns: TableColumn[] = [
    { field: 'externalUserId', header: 'Usuario Externo', sortable: true, filterable: true },
    { field: 'status', header: 'Estado', sortable: true, filterable: true },
    { field: 'channel.name', header: 'Canal', sortable: true },
    { field: 'startedAt', header: 'Inicio', sortable: true, type: 'date' },
    { field: 'lastMessageAt', header: 'Último Mensaje', sortable: true, type: 'date' },
    { field: 'createdAt', header: 'Fecha de Creación', sortable: true, type: 'date' },
  ];

  actions: TableAction[] = [
    {
      label: 'Ver',
      icon: 'pi pi-eye',
      severity: 'info',
      command: (conversation: Conversation) => this.viewConversation(conversation),
    },
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      severity: 'primary',
      command: (conversation: Conversation) => this.editConversation(conversation),
    },
    {
      label: 'Eliminar',
      icon: 'pi pi-trash',
      severity: 'danger',
      command: (conversation: Conversation) => this.deleteConversation(conversation),
    },
  ];

  ngOnInit(): void {
    this.loadConversations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadConversations(): void {
    this.loading = true;
    this.conversationsService
      .findAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (conversations) => {
          this.conversations = conversations;
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar las conversaciones',
          });
          this.loading = false;
        },
      });
  }

  onSearch(searchText: string): void {
    this.searchText = searchText;
  }

  createConversation(): void {
    this.router.navigate(['/conversations/new']);
  }

  viewConversation(conversation: Conversation): void {
    this.router.navigate(['/conversations', conversation.id]);
  }

  editConversation(conversation: Conversation): void {
    this.router.navigate(['/conversations', conversation.id, 'edit']);
  }

  deleteConversation(conversation: Conversation): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar la conversación con "${conversation.externalUserId}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.conversationsService
          .delete(conversation.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
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
                detail: 'No se pudo eliminar la conversación',
              });
            },
          });
      },
    });
  }
}
