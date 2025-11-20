import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';
import { MessageService } from 'primeng/api';
import { ConversationsService } from '../../services/conversations.service';
import { Conversation, ConversationStatus, Message } from '../../models/conversations.model';

@Component({
  selector: 'app-conversations-detail',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, DividerModule, SkeletonModule, ToastModule, TagModule, TimelineModule],
  providers: [MessageService],
  templateUrl: './conversations-detail.component.html',
  styleUrl: './conversations-detail.component.scss',
})
export class ConversationsDetailComponent implements OnInit, OnDestroy {
  private conversationsService = inject(ConversationsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private readonly destroy$ = new Subject<void>();

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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadConversation(id: string): void {
    this.loading = true;
    this.conversationsService
      .findOne(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
    this.conversationsService
      .getMessages(conversationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
