import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TenantsService } from '../tenants.service';
import { Tenant } from '../tenant.model';

@Component({
  selector: 'app-tenants-detail',
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
    <div class="tenants-detail-page">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-content-between align-items-center p-3">
            <h2>Detalle del Tenant</h2>
            <div class="flex gap-2">
              <p-button
                label="Editar"
                icon="pi pi-pencil"
                (onClick)="goToEdit()"
                [disabled]="!tenant"
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

        <div *ngIf="!loading && tenant" class="tenant-details">
          <div class="detail-section">
            <h3>Información General</h3>
            <p-divider></p-divider>

            <div class="detail-grid">
              <div class="detail-item">
                <label>Nombre:</label>
                <span class="value">{{ tenant.name }}</span>
              </div>

              <div class="detail-item">
                <label>Slug:</label>
                <span class="value text-primary font-semibold">{{ tenant.slug }}</span>
              </div>

              <div class="detail-item">
                <label>Email de Contacto:</label>
                <span class="value">{{ tenant.contactEmail || '-' }}</span>
              </div>

              <div class="detail-item">
                <label>Teléfono:</label>
                <span class="value">{{ tenant.contactPhone || '-' }}</span>
              </div>

              <div class="detail-item">
                <label>Idioma:</label>
                <span class="value">{{ tenant.language || 'es' }}</span>
              </div>

              <div class="detail-item">
                <label>Zona Horaria:</label>
                <span class="value">{{ tenant.timezone || 'UTC' }}</span>
              </div>

              <div class="detail-item">
                <label>Estado:</label>
                <span
                  [class]="
                    'badge ' + (tenant.isActive ? 'badge-success' : 'badge-danger')
                  "
                >
                  {{ tenant.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
            </div>
          </div>

          <div class="detail-section" *ngIf="tenant.llmProvider">
            <h3>Configuración LLM</h3>
            <p-divider></p-divider>

            <div class="detail-grid">
              <div class="detail-item">
                <label>Proveedor:</label>
                <span class="value">{{ tenant.llmProvider }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section" *ngIf="tenant.primaryColor || tenant.logoUrl">
            <h3>Branding</h3>
            <p-divider></p-divider>

            <div class="detail-grid">
              <div class="detail-item" *ngIf="tenant.primaryColor">
                <label>Color Primario:</label>
                <span class="value">
                  <span
                    class="color-preview"
                    [style.background-color]="tenant.primaryColor"
                  ></span>
                  {{ tenant.primaryColor }}
                </span>
              </div>

              <div class="detail-item" *ngIf="tenant.logoUrl">
                <label>Logo:</label>
                <span class="value">
                  <a [href]="tenant.logoUrl" target="_blank" class="link">Ver logo</a>
                </span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Metadatos</h3>
            <p-divider></p-divider>

            <div class="detail-grid">
              <div class="detail-item">
                <label>Creado:</label>
                <span class="value">{{ tenant.createdAt | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>

              <div class="detail-item">
                <label>Última actualización:</label>
                <span class="value">{{ tenant.updatedAt | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>

              <div class="detail-item">
                <label>ID:</label>
                <span class="value text-sm text-gray-500">{{ tenant.id }}</span>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="!loading && !tenant" class="text-center p-5">
          <i class="pi pi-exclamation-circle text-4xl text-red-500 mb-3"></i>
          <p>Tenant no encontrado</p>
        </div>
      </p-card>

      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .tenants-detail-page {
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

    .color-preview {
      display: inline-block;
      width: 20px;
      height: 20px;
      border-radius: 4px;
      border: 1px solid #dee2e6;
      margin-right: 0.5rem;
      vertical-align: middle;
    }

    .link {
      color: #007bff;
      text-decoration: none;
    }

    .link:hover {
      text-decoration: underline;
    }
  `],
})
export class TenantsDetailPage implements OnInit {
  private tenantsService = inject(TenantsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  tenant: Tenant | null = null;
  loading = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTenant(id);
    }
  }

  loadTenant(id: string): void {
    this.loading = true;
    this.tenantsService.findOne(id).subscribe({
      next: (tenant) => {
        this.tenant = tenant;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el tenant',
        });
        this.loading = false;
      },
    });
  }

  goToEdit(): void {
    if (this.tenant) {
      this.router.navigate(['/tenants', this.tenant.id, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/tenants']);
  }
}
