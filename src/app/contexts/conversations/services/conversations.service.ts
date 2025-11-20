import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpService } from '../../../core/http/http.service';
import { Conversation, ConversationStatus, CreateConversationDto, CreateMessageDto, Message, UpdateConversationDto } from '../models/conversations.model';
import { PaginatedResponse } from '../../../shared/models/pagination.model';

/**
 * Servicio para gestión de Conversations
 * Endpoints generados desde swagger-export.json
 */
@Injectable({
  providedIn: 'root',
})
export class ConversationsService {
  private readonly http = inject(HttpService);
  private readonly baseUrl = '/conversations';

  // Estado interno (mini-store)
  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  public conversations$ = this.conversationsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  /**
   * GET /api/v1/conversations
   * Listar todas las conversaciones
   */
  findAll(): Observable<PaginatedResponse<Conversation>> {
    this.loadingSubject.next(true);

    return this.http.get<PaginatedResponse<Conversation>>(this.baseUrl).pipe(
      tap({
        next: (response) => {
          this.conversationsSubject.next(response.data);
          this.loadingSubject.next(false);
        },
        error: () => {
          this.loadingSubject.next(false);
        },
      }),
    );
  }

  /**
   * GET /api/v1/conversations/status/{status}
   * Listar conversaciones por estado
   */
  findByStatus(status: ConversationStatus): Observable<PaginatedResponse<Conversation>> {
    return this.http.get<PaginatedResponse<Conversation>>(`${this.baseUrl}/status/${status}`);
  }

  /**
   * GET /api/v1/conversations/channel/{channelId}
   * Listar conversaciones por canal
   */
  findByChannel(channelId: string): Observable<PaginatedResponse<Conversation>> {
    return this.http.get<PaginatedResponse<Conversation>>(`${this.baseUrl}/channel/${channelId}`);
  }

  /**
   * GET /api/v1/conversations/{id}
   * Obtener una conversación por ID
   */
  findOne(id: string): Observable<Conversation> {
    return this.http.get<Conversation>(`${this.baseUrl}/${id}`);
  }

  /**
   * POST /api/v1/conversations
   * Crear una nueva conversación
   */
  create(dto: CreateConversationDto): Observable<Conversation> {
    return this.http.post<Conversation>(this.baseUrl, dto).pipe(
      tap((newConversation) => {
        const currentConversations = this.conversationsSubject.value;
        this.conversationsSubject.next([...currentConversations, newConversation]);
      }),
    );
  }

  /**
   * PUT /api/v1/conversations/{id}
   * Actualizar una conversación
   */
  update(id: string, dto: UpdateConversationDto): Observable<Conversation> {
    return this.http.put<Conversation>(`${this.baseUrl}/${id}`, dto).pipe(
      tap((updatedConversation) => {
        const currentConversations = this.conversationsSubject.value;
        const index = currentConversations.findIndex((c) => c.id === id);
        if (index !== -1) {
          currentConversations[index] = updatedConversation;
          this.conversationsSubject.next([...currentConversations]);
        }
      }),
    );
  }

  /**
   * DELETE /api/v1/conversations/{id}
   * Eliminar una conversación (soft delete)
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        const currentConversations = this.conversationsSubject.value;
        this.conversationsSubject.next(currentConversations.filter((c) => c.id !== id));
      }),
    );
  }

  /**
   * GET /api/v1/conversations/{id}/context
   * Obtener el contexto de una conversación
   */
  getContext(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}/context`);
  }

  /**
   * PUT /api/v1/conversations/{id}/context
   * Actualizar el contexto de una conversación
   */
  updateContext(id: string, context: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}/context`, context);
  }

  /**
   * GET /api/v1/conversations/{id}/flow
   * Obtener el flujo actual de una conversación
   */
  getFlow(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}/flow`);
  }

  /**
   * PUT /api/v1/conversations/{id}/flow
   * Actualizar el flujo de una conversación
   */
  updateFlow(id: string, flowData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}/flow`, flowData);
  }

  /**
   * POST /api/v1/conversations/{id}/complete
   * Completar una conversación
   */
  complete(id: string): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.baseUrl}/${id}/complete`, {});
  }

  /**
   * POST /api/v1/conversations/{id}/abandon
   * Abandonar una conversación
   */
  abandon(id: string): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.baseUrl}/${id}/abandon`, {});
  }

  /**
   * GET /api/v1/conversations/{conversationId}/messages
   * Obtener mensajes de una conversación
   */
  getMessages(conversationId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.baseUrl}/${conversationId}/messages`);
  }

  /**
   * POST /api/v1/conversations/{conversationId}/messages
   * Crear un mensaje en una conversación
   */
  createMessage(conversationId: string, dto: CreateMessageDto): Observable<Message> {
    return this.http.post<Message>(`${this.baseUrl}/${conversationId}/messages`, dto);
  }

  /**
   * GET /api/v1/conversations/{conversationId}/messages/{id}
   * Obtener un mensaje específico
   */
  getMessage(conversationId: string, messageId: string): Observable<Message> {
    return this.http.get<Message>(`${this.baseUrl}/${conversationId}/messages/${messageId}`);
  }
}
