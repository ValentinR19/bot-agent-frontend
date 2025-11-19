import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpService } from '../../../core/http/http.service';
import { Channel, ChannelType, CreateChannelDto, UpdateChannelDto } from '../models/channel.model';
import { TelegramConfigDto, TelegramSetupDto, WebhookInfo } from '../models/dtos/telegram-setup.dto';

/**
 * Servicio para gestión de Channels (Telegram, WhatsApp, etc)
 * Endpoints generados desde swagger-export.json
 */
@Injectable({
  providedIn: 'root',
})
export class ChannelsService {
  private readonly http = inject(HttpService);
  private readonly baseUrl = '/channels';

  // Estado interno (mini-store)
  private channelsSubject = new BehaviorSubject<Channel[]>([]);
  public channels$ = this.channelsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  /**
   * GET /api/v1/channels
   * Listar todos los canales
   */
  findAll(): Observable<Channel[]> {
    this.loadingSubject.next(true);

    return this.http.get<Channel[]>(this.baseUrl).pipe(
      tap({
        next: (channels) => {
          this.channelsSubject.next(channels);
          this.loadingSubject.next(false);
        },
        error: () => {
          this.loadingSubject.next(false);
        },
      }),
    );
  }

  /**
   * GET /api/v1/channels/active
   * Listar canales activos
   */
  findActive(): Observable<Channel[]> {
    return this.http.get<Channel[]>(`${this.baseUrl}/active`);
  }

  /**
   * GET /api/v1/channels/type/{type}
   * Listar canales por tipo
   */
  findByType(type: ChannelType): Observable<Channel[]> {
    return this.http.get<Channel[]>(`${this.baseUrl}/type/${type}`);
  }

  /**
   * GET /api/v1/channels/{id}
   * Obtener un canal por ID
   */
  findOne(id: string): Observable<Channel> {
    return this.http.get<Channel>(`${this.baseUrl}/${id}`);
  }

  /**
   * POST /api/v1/channels
   * Crear un nuevo canal
   */
  create(dto: CreateChannelDto): Observable<Channel> {
    return this.http.post<Channel>(this.baseUrl, dto).pipe(
      tap((newChannel) => {
        const currentChannels = this.channelsSubject.value;
        this.channelsSubject.next([...currentChannels, newChannel]);
      }),
    );
  }

  /**
   * PUT /api/v1/channels/{id}
   * Actualizar un canal
   */
  update(id: string, dto: UpdateChannelDto): Observable<Channel> {
    return this.http.put<Channel>(`${this.baseUrl}/${id}`, dto).pipe(
      tap((updatedChannel) => {
        const currentChannels = this.channelsSubject.value;
        const index = currentChannels.findIndex((c) => c.id === id);
        if (index !== -1) {
          currentChannels[index] = updatedChannel;
          this.channelsSubject.next([...currentChannels]);
        }
      }),
    );
  }

  /**
   * DELETE /api/v1/channels/{id}
   * Eliminar un canal (soft delete)
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        const currentChannels = this.channelsSubject.value;
        this.channelsSubject.next(currentChannels.filter((c) => c.id !== id));
      }),
    );
  }

  /**
   * POST /api/v1/channels/{id}/telegram/setup
   * Configurar Telegram para un canal
   */
  setupTelegram(id: string, dto: TelegramSetupDto): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/telegram/setup`, dto);
  }

  /**
   * PUT /api/v1/channels/{id}/telegram/config
   * Actualizar configuración de Telegram
   */
  updateTelegramConfig(id: string, dto: TelegramConfigDto): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}/telegram/config`, dto);
  }

  /**
   * GET /api/v1/channels/{id}/telegram/webhook-info
   * Obtener información del webhook de Telegram
   */
  getTelegramWebhookInfo(id: string): Observable<WebhookInfo> {
    return this.http.get<WebhookInfo>(`${this.baseUrl}/${id}/telegram/webhook-info`);
  }
}
