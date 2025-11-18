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
import { PermissionsService } from '../permissions.service';
import { PermissionCatalog } from '../permission.model';

@Component({
  selector: 'app-permissions-detail',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    DividerModule,
    SkeletonModule,
    ToastModule,
    TagModule,
  ],
  providers: [MessageService],
  template: `
    <div class="permissions-detail-page">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-content-between align-items-center p-3">
            <h2>Detalle del Permiso</h2>
            <div class="flex gap-2">
              <p-button
                label="Editar"
                icon="pi pi-pencil"
                (onClick)="goToEdit()"
                [disabled]="!permission"
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

        <div *ngIf="!loading && permission" class="permission-details">
          <div class="detail-section">
            <h3>Información General</h3>
            <p-divider></p-divider>

            <div class="detail-grid">
              <div class="detail-item">
                <label>Clave (Key):</label>
                <span class="value font-mono text-primary font-semibold">{{ permission.key }}</span>
              </div>

              <div class="detail-item">
                <label>Módulo:</label>
                <p-tag [value]="permission.module" severity="info"></p-tag>
              </div>

              <div class="detail-item">
                <label>Estado:</label>
                <p-tag
                  [value]="permission.isActive ? 'Activo' : 'Inactivo'"
                  [severity]="permission.isActive ? 'success' : 'danger'"
                ></p-tag>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Descripción</h3>
            <p-divider></p-divider>

            <div class="description-box">
              <p>{{ permission.description }}</p>
            </div>
          </div>

          <div class="detail-section">
            <h3>Formato de Clave</h3>
            <p-divider></p-divider>

            <div class="format-explanation">
              <p class="mb-2">
                Las claves de permisos generalmente siguen el formato:
                <code class="key-format">modulo.accion</code>
              </p>
              <p class="mb-2">
                <strong>Módulo:</strong> <code>{{ getModuleFromKey() }}</code>
              </p>
              <p>
                <strong>Acción:</strong> <code>{{ getActionFromKey() }}</code>
              </p>
            </div>
          </div>

          <div class="detail-section">
            <h3>Metadatos</h3>
            <p-divider></p-divider>

            <div class="detail-grid">
              <div class="detail-item">
                <label>Creado:</label>
                <span class="value">{{ permission.createdAt | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>

              <div class="detail-item">
                <label>Última actualización:</label>
                <span class="value">{{ permission.updatedAt | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="!loading && !permission" class="text-center p-5">
          <i class="pi pi-exclamation-circle text-4xl text-red-500 mb-3"></i>
          <p>Permiso no encontrado</p>
        </div>
      </p-card>

      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .permissions-detail-page {
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

    .font-mono {
      font-family: 'Courier New', monospace;
    }

    .description-box {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 1rem;
      margin-top: 1rem;
    }

    .description-box p {
      margin: 0;
      line-height: 1.6;
    }

    .format-explanation {
      background: #e7f3ff;
      border: 1px solid #b3d9ff;
      border-radius: 8px;
      padding: 1rem;
      margin-top: 1rem;
    }

    .format-explanation p {
      line-height: 1.6;
    }

    .format-explanation code,
    .key-format {
      background: #ffffff;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      color: #0066cc;
      border: 1px solid #b3d9ff;
    }
  `],
})
export class PermissionsDetailPage implements OnInit {
  private permissionsService = inject(PermissionsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  permission: PermissionCatalog | null = null;
  loading = false;

  ngOnInit(): void {
    const key = this.route.snapshot.paramMap.get('key');
    if (key) {
      this.loadPermission(key);
    }
  }

  loadPermission(key: string): void {
    this.loading = true;
    this.permissionsService.getPermissionByKey(key).subscribe({
      next: (permission) => {
        this.permission = permission;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el permiso',
        });
        this.loading = false;
      },
    });
  }

  getModuleFromKey(): string {
    if (!this.permission) return '-';
    const parts = this.permission.key.split('.');
    return parts[0] || '-';
  }

  getActionFromKey(): string {
    if (!this.permission) return '-';
    const parts = this.permission.key.split('.');
    return parts.slice(1).join('.') || '-';
  }

  goToEdit(): void {
    if (this.permission) {
      this.router.navigate(['/permissions', this.permission.key, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/permissions']);
  }
}
