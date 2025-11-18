import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ChannelsService } from '../channels.service';
import { Channel } from '../channel.model';

@Component({
  selector: 'app-channels-detail',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    DividerModule,
    SkeletonModule,
    ToastModule,
  ],
  providers: [MessageService],
  template: `
    <div class="channels-detail-page">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-content-between align-items-center p-3">
            <h2>Detalle del Canal</h2>
            <div class="flex gap-2">
              <p-button
                label="Editar"
                icon="pi pi-pencil"
                (onClick)="goToEdit()"
                [disabled]="!channel"
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

        <div *ngIf="!loading && channel" class="channel-details">
          <div class="detail-section">
            <h3>Información General</h3>
            <p-divider></p-divider>

            <div class="detail-grid">
              <div class="detail-item">
                <label>Nombre:</label>
                <span class="value">{{ channel.name }}</span>
              </div>

              <div class="detail-item">
                <label>Tipo:</label>
                <span [class]="'badge badge-' + channel.type">
                  {{ getChannelTypeLabel(channel.type) }}
                </span>
              </div>

              <div class="detail-item">
                <label>Descripción:</label>
                <span class="value">{{ channel.description || '-' }}</span>
              </div>

              <div class="detail-item">
                <label>Estado:</label>
                <span
                  [class]="
                    'badge ' + (channel.isActive ? 'badge-success' : 'badge-danger')
                  "
                >
                  {{ channel.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
            </div>
          </div>

          <div class="detail-section" *ngIf="channel.type === 'telegram' && channel.telegramConfig">
            <h3>Configuración de Telegram</h3>
            <p-divider></p-divider>

            <div class="detail-grid">
              <div class="detail-item">
                <label>Bot Username:</label>
                <span class="value">{{ channel.telegramConfig.botUsername }}</span>
              </div>

              <div class="detail-item">
                <label>Webhook URL:</label>
                <span class="value text-sm">{{ channel.telegramConfig.webhookUrl }}</span>
              </div>

              <div class="detail-item">
                <label>Webhook Configurado:</label>
                <span
                  [class]="
                    'badge ' + (channel.telegramConfig.isWebhookSet ? 'badge-success' : 'badge-danger')
                  "
                >
                  {{ channel.telegramConfig.isWebhookSet ? 'Sí' : 'No' }}
                </span>
              </div>

              <div class="detail-item">
                <label>Max Conexiones:</label>
                <span class="value">{{ channel.telegramConfig.maxConnections || 40 }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Metadatos</h3>
            <p-divider></p-divider>

            <div class="detail-grid">
              <div class="detail-item">
                <label>Creado:</label>
                <span class="value">{{ channel.createdAt | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>

              <div class="detail-item">
                <label>Última actualización:</label>
                <span class="value">{{ channel.updatedAt | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>

              <div class="detail-item">
                <label>ID:</label>
                <span class="value text-sm text-gray-500">{{ channel.id }}</span>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="!loading && !channel" class="text-center p-5">
          <i class="pi pi-exclamation-circle text-4xl text-red-500 mb-3"></i>
          <p>Canal no encontrado</p>
        </div>
      </p-card>

      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .channels-detail-page {
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

    .badge {
      display: inline-block;
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
export class ChannelsDetailPage implements OnInit {
  private channelsService = inject(ChannelsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  channel: Channel | null = null;
  loading = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadChannel(id);
    }
  }

  loadChannel(id: string): void {
    this.loading = true;
    this.channelsService.findOne(id).subscribe({
      next: (channel) => {
        this.channel = channel;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el canal',
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

  goToEdit(): void {
    if (this.channel) {
      this.router.navigate(['/channels', this.channel.id, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/channels']);
  }
}
