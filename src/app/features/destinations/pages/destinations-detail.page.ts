import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { DestinationsService } from '../destinations.service';
import { Destination } from '../destination.model';

@Component({
  selector: 'app-destinations-detail',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, DividerModule, SkeletonModule, ToastModule, TagModule],
  providers: [MessageService],
  template: `
    <div class="destinations-detail-page">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-content-between align-items-center p-3">
            <h2>Detalle del Destino</h2>
            <div class="flex gap-2">
              <p-button label="Probar" icon="pi pi-bolt" severity="help" (onClick)="testDestination()" [disabled]="!destination"></p-button>
              <p-button label="Editar" icon="pi pi-pencil" (onClick)="goToEdit()" [disabled]="!destination"></p-button>
              <p-button label="Volver" icon="pi pi-arrow-left" severity="secondary" (onClick)="goBack()"></p-button>
            </div>
          </div>
        </ng-template>

        <div *ngIf="loading" class="loading-skeleton">
          <p-skeleton height="2rem" styleClass="mb-3"></p-skeleton>
          <p-skeleton height="1.5rem" styleClass="mb-2"></p-skeleton>
          <p-skeleton height="1.5rem" styleClass="mb-2"></p-skeleton>
          <p-skeleton height="1.5rem" styleClass="mb-2"></p-skeleton>
        </div>

        <div *ngIf="!loading && destination" class="destination-details">
          <div class="detail-section">
            <h3>Información General</h3>
            <p-divider></p-divider>

            <div class="detail-grid">
              <div class="detail-item">
                <label>Nombre:</label>
                <span class="value">{{ destination.name }}</span>
              </div>

              <div class="detail-item">
                <label>Tipo:</label>
                <p-tag [value]="getTypeLabel(destination.type)" severity="info"></p-tag>
              </div>

              <div class="detail-item">
                <label>Descripción:</label>
                <span class="value">{{ destination.description || '-' }}</span>
              </div>

              <div class="detail-item">
                <label>Estado:</label>
                <p-tag [value]="destination.isActive ? 'Activo' : 'Inactivo'" [severity]="destination.isActive ? 'success' : 'danger'"></p-tag>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Estadísticas</h3>
            <p-divider></p-divider>

            <div class="detail-grid">
              <div class="detail-item">
                <label>Total de Llamadas:</label>
                <span class="value font-semibold text-blue-600">{{ destination.totalCalls }}</span>
              </div>

              <div class="detail-item">
                <label>Total de Errores:</label>
                <span class="value font-semibold" [class.text-red-600]="destination.totalErrors > 0" [class.text-green-600]="destination.totalErrors === 0">
                  {{ destination.totalErrors }}
                </span>
              </div>

              <div class="detail-item">
                <label>Tasa de Éxito:</label>
                <span class="value font-semibold"> {{ getSuccessRate() }}% </span>
              </div>

              <div class="detail-item">
                <label>Último Uso:</label>
                <span class="value">
                  {{ destination.lastUsedAt ? (destination.lastUsedAt | date: 'dd/MM/yyyy HH:mm') : 'Nunca' }}
                </span>
              </div>
            </div>
          </div>

          <div class="detail-section" *ngIf="destination.retryConfig">
            <h3>Configuración de Reintentos</h3>
            <p-divider></p-divider>

            <div class="detail-grid">
              <div class="detail-item" *ngIf="destination.retryConfig.maxRetries">
                <label>Reintentos Máximos:</label>
                <span class="value">{{ destination.retryConfig.maxRetries }}</span>
              </div>

              <div class="detail-item" *ngIf="destination.retryConfig.retryDelay">
                <label>Retraso entre Reintentos:</label>
                <span class="value">{{ destination.retryConfig.retryDelay }}ms</span>
              </div>

              <div class="detail-item" *ngIf="destination.retryConfig.backoffMultiplier">
                <label>Multiplicador de Backoff:</label>
                <span class="value">{{ destination.retryConfig.backoffMultiplier }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section" *ngIf="destination.rateLimit">
            <h3>Límite de Tasa</h3>
            <p-divider></p-divider>

            <div class="detail-grid">
              <div class="detail-item" *ngIf="destination.rateLimit.maxRequests">
                <label>Solicitudes Máximas:</label>
                <span class="value">{{ destination.rateLimit.maxRequests }}</span>
              </div>

              <div class="detail-item" *ngIf="destination.rateLimit.windowMs">
                <label>Ventana de Tiempo:</label>
                <span class="value">{{ destination.rateLimit.windowMs }}ms</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Configuración</h3>
            <p-divider></p-divider>

            <div class="config-display">
              <pre>{{ getConfigDisplay() }}</pre>
            </div>
          </div>

          <div class="detail-section">
            <h3>Metadatos</h3>
            <p-divider></p-divider>

            <div class="detail-grid">
              <div class="detail-item">
                <label>Creado:</label>
                <span class="value">{{ destination.createdAt | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>

              <div class="detail-item">
                <label>Última actualización:</label>
                <span class="value">{{ destination.updatedAt | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>

              <div class="detail-item">
                <label>ID:</label>
                <span class="value text-sm text-gray-500">{{ destination.id }}</span>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="!loading && !destination" class="text-center p-5">
          <i class="pi pi-exclamation-circle text-4xl text-red-500 mb-3"></i>
          <p>Destino no encontrado</p>
        </div>
      </p-card>

      <p-toast></p-toast>
    </div>
  `,
  styles: [
    `
      .destinations-detail-page {
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

      .config-display {
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 8px;
        padding: 1rem;
        margin-top: 1rem;
      }

      .config-display pre {
        margin: 0;
        font-family: 'Courier New', monospace;
        font-size: 0.875rem;
        white-space: pre-wrap;
        word-wrap: break-word;
      }
    `,
  ],
})
export class DestinationsDetailPage implements OnInit {
  private destinationsService = inject(DestinationsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  destination: Destination | null = null;
  loading = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDestination(id);
    }
  }

  loadDestination(id: string): void {
    this.loading = true;
    this.destinationsService.getDestinationById(id).subscribe({
      next: (destination) => {
        this.destination = destination;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el destino',
        });
        this.loading = false;
      },
    });
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      email: 'Email',
      webhook: 'Webhook',
      api: 'API',
      crm: 'CRM',
      erp: 'ERP',
      slack: 'Slack',
      whatsapp_business: 'WhatsApp Business',
      zapier: 'Zapier',
      make: 'Make',
      custom: 'Personalizado',
    };
    return labels[type] || type;
  }

  getSuccessRate(): string {
    if (!this.destination || this.destination.totalCalls === 0) {
      return '0';
    }
    const successRate = ((this.destination.totalCalls - this.destination.totalErrors) / this.destination.totalCalls) * 100;
    return successRate.toFixed(2);
  }

  getConfigDisplay(): string {
    if (!this.destination?.config) return 'Sin configuración';
    return JSON.stringify(this.destination.config, null, 2);
  }

  testDestination(): void {
    if (!this.destination) return;

    this.destinationsService.testDestination(this.destination.id, {}).subscribe({
      next: (result) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Prueba Exitosa',
          detail: 'La conexión con el destino fue exitosa',
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error en Prueba',
          detail: 'Error al probar la conexión con el destino',
        });
      },
    });
  }

  goToEdit(): void {
    if (this.destination) {
      this.router.navigate(['/destinations', this.destination.id, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/destinations']);
  }
}
