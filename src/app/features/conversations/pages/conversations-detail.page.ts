import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';
import { MessageService } from 'primeng/api';
import { ConversationsService } from '../conversations.service';
import { Conversation, ConversationStatus, Message } from '../conversations.model';

@Component({
  selector: 'app-conversations-detail',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    DividerModule,
    SkeletonModule,
    ToastModule,
    TagModule,
    TimelineModule,
  ],
  providers: [MessageService],
  template: `
    <div class="conversations-detail-page">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-content-between align-items-center p-3">
            <h2>Detalle de la Conversación</h2>
            <div class="flex gap-2">
              <p-button
                label="Editar"
                icon="pi pi-pencil"
                (onClick)="goToEdit()"
                [disabled]="!conversation"
              ></p-button>
              <p-button
                label="Volver"
                icon="pi pi-arrow-left"
                severity="secondary"
                (onClick)="goBack()"
              ></p-button>
            </div>
          </div>
        </ng-template>

        <div *ngIf="loading" class="loading-skeleton">
          <p-skeleton height="2rem" styleClass="mb-3"></p-skeleton>
          <p-skeleton height="1.5rem" styleClass="mb-2"></p-skeleton>
          <p-skeleton height="1.5rem" styleClass="mb-2"></p-skeleton>
          <p-skeleton height="1.5rem" styleClass="mb-2"></p-skeleton>
        </div>

        <div *ngIf="!loading && conversation" class="conversation-details">
          <div class="detail-section">
            <h3>Información General</h3>
            <p-divider></p-divider>

            <div class="detail-grid">
              <div class="detail-item">
                <label>Usuario Externo:</label>
                <span class="value">{{ conversation.externalUserId }}</span>
              </div>

              <div class="detail-item">
                <label>Canal:</label>
                <span class="value">
                  <strong>{{ conversation.channel?.name || 'N/A' }}</strong>
                  <br />
                  <small class="text-gray-500">{{ conversation.channel?.type || '' }}</small>
                </span>
              </div>

              <div class="detail-item">
                <label>Estado:</label>
                <p-tag
                  [value]="getStatusLabel(conversation.status)"
                  [severity]="getStatusSeverity(conversation.status)"
                ></p-tag>
              </div>

              <div class="detail-item">
                <label>Flujo Actual:</label>
                <span class="value">{{ conversation.currentFlowId || '-' }}</span>
              </div>

              <div class="detail-item">
                <label>Nodo Actual:</label>
                <span class="value">{{ conversation.currentNodeId || '-' }}</span>
              </div>

              <div class="detail-item">
                <label>Último Mensaje:</label>
                <span class="value">
                  {{ conversation.lastMessageAt ? (conversation.lastMessageAt | date: 'dd/MM/yyyy HH:mm') : '-' }}
                </span>
              </div>
            </div>
          </div>

          <div class="detail-section" *ngIf="conversation.context">
            <h3>Contexto</h3>
            <p-divider></p-divider>

            <div class="detail-grid">
              <div class="detail-item" *ngFor="let key of getContextKeys()">
                <label>{{ key }}:</label>
                <span class="value">{{ conversation.context![key] }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section" *ngIf="messages.length > 0">
            <h3>Mensajes ({{ messages.length }})</h3>
            <p-divider></p-divider>

            <p-timeline [value]="messages" align="left">
              <ng-template pTemplate="content" let-message>
                <div class="message-card">
                  <div class="message-header">
                    <span class="message-direction" [class.inbound]="message.direction === 'inbound'" [class.outbound]="message.direction === 'outbound'">
                      {{ message.direction === 'inbound' ? 'Entrada' : 'Salida' }}
                    </span>
                    <span class="message-time">{{ message.createdAt | date: 'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                  <div class="message-content">
                    <p>{{ message.content }}</p>
                    <small class="text-gray-500">Tipo: {{ message.type }}</small>
                  </div>
                </div>
              </ng-template>
            </p-timeline>
          </div>

          <div class="detail-section">
            <h3>Metadatos</h3>
            <p-divider></p-divider>

            <div class="detail-grid">
              <div class="detail-item">
                <label>Iniciada:</label>
                <span class="value">{{ conversation.startedAt | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>

              <div class="detail-item" *ngIf="conversation.completedAt">
                <label>Completada:</label>
                <span class="value">{{ conversation.completedAt | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>

              <div class="detail-item" *ngIf="conversation.abandonedAt">
                <label>Abandonada:</label>
                <span class="value">{{ conversation.abandonedAt | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>

              <div class="detail-item">
                <label>Creada:</label>
                <span class="value">{{ conversation.createdAt | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>

              <div class="detail-item">
                <label>Última actualización:</label>
                <span class="value">{{ conversation.updatedAt | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>

              <div class="detail-item">
                <label>ID:</label>
                <span class="value text-sm text-gray-500">{{ conversation.id }}</span>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="!loading && !conversation" class="text-center p-5">
          <i class="pi pi-exclamation-circle text-4xl text-red-500 mb-3"></i>
          <p>Conversación no encontrada</p>
        </div>
      </p-card>

      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .conversations-detail-page {
      padding: 1.5rem;
    }

    .detail-section {
      margin-bottom: 2rem;
    }

    .detail-section h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-top: 1rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .detail-item label {
      font-weight: 600;
      color: #6c757d;
      font-size: 0.875rem;
      text-transform: uppercase;
    }

    .detail-item .value {
      font-size: 1rem;
      color: #212529;
    }

    .message-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .message-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .message-direction {
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.875rem;
    }

    .message-direction.inbound {
      background-color: #d1ecf1;
      color: #0c5460;
    }

    .message-direction.outbound {
      background-color: #d4edda;
      color: #155724;
    }

    .message-time {
      font-size: 0.875rem;
      color: #6c757d;
    }

    .message-content p {
      margin: 0.5rem 0;
      line-height: 1.5;
    }
  `],
})
export class ConversationsDetailPage implements OnInit {
  private conversationsService = inject(ConversationsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  conversation: Conversation | null = null;
  messages: Message[] = [];
  loading = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadConversation(id);
      this.loadMessages(id);
    }
  }

  loadConversation(id: string): void {
    this.loading = true;
    this.conversationsService.findOne(id).subscribe({
      next: (conversation) => {
        this.conversation = conversation;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar la conversación',
        });
        this.loading = false;
      },
    });
  }

  loadMessages(conversationId: string): void {
    this.conversationsService.getMessages(conversationId).subscribe({
      next: (messages) => {
        this.messages = messages;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar mensajes',
        });
      },
    });
  }

  getContextKeys(): string[] {
    if (!this.conversation?.context) return [];
    return Object.keys(this.conversation.context);
  }

  goToEdit(): void {
    if (this.conversation) {
      this.router.navigate(['/conversations', this.conversation.id, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/conversations']);
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
