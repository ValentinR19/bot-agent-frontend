import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { RolesService } from '../roles.service';
import { Role } from '../role.model';

@Component({
  selector: 'app-roles-detail',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    DividerModule,
    SkeletonModule,
    ToastModule,
    TableModule,
  ],
  providers: [MessageService],
  template: `
    <div class="roles-detail-page">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-content-between align-items-center p-3">
            <h2>Detalle del Rol</h2>
            <div class="flex gap-2">
              <p-button
                label="Editar"
                icon="pi pi-pencil"
                (onClick)="goToEdit()"
                [disabled]="!role || role.isSystem"
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

        <div *ngIf="!loading && role" class="role-details">
          <div class="detail-section">
            <h3>Información General</h3>
            <p-divider></p-divider>

            <div class="detail-grid">
              <div class="detail-item">
                <label>Nombre:</label>
                <span class="value">{{ role.name }}</span>
              </div>

              <div class="detail-item">
                <label>Descripción:</label>
                <span class="value">{{ role.description || '-' }}</span>
              </div>

              <div class="detail-item">
                <label>Tipo:</label>
                <span
                  [class]="
                    'badge ' + (role.isSystem ? 'badge-info' : 'badge-secondary')
                  "
                >
                  {{ role.isSystem ? 'Sistema' : 'Personalizado' }}
                </span>
              </div>

              <div class="detail-item">
                <label>Estado:</label>
                <span
                  [class]="
                    'badge ' + (role.isActive ? 'badge-success' : 'badge-danger')
                  "
                >
                  {{ role.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </div>

              <div class="detail-item">
                <label>Permisos:</label>
                <span class="value">{{ role.permissions?.length || 0 }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section" *ngIf="role.permissions && role.permissions.length > 0">
            <h3>Permisos Asignados</h3>
            <p-divider></p-divider>

            <p-table [value]="role.permissions" [paginator]="true" [rows]="10">
              <ng-template pTemplate="header">
                <tr>
                  <th>Clave</th>
                  <th>Descripción</th>
                  <th>Módulo</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-rolePermission>
                <tr>
                  <td>
                    <span class="font-semibold">{{ rolePermission.permissionKey }}</span>
                  </td>
                  <td>{{ rolePermission.permission?.description || '-' }}</td>
                  <td>
                    <span class="badge badge-module">{{ rolePermission.permission?.module || '-' }}</span>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="3" class="text-center">No hay permisos asignados a este rol.</td>
                </tr>
              </ng-template>
            </p-table>
          </div>

          <div class="detail-section">
            <h3>Metadatos</h3>
            <p-divider></p-divider>

            <div class="detail-grid">
              <div class="detail-item">
                <label>Creado:</label>
                <span class="value">{{ role.createdAt | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>

              <div class="detail-item">
                <label>Última actualización:</label>
                <span class="value">{{ role.updatedAt | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>

              <div class="detail-item">
                <label>ID:</label>
                <span class="value text-sm text-gray-500">{{ role.id }}</span>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="!loading && !role" class="text-center p-5">
          <i class="pi pi-exclamation-circle text-4xl text-red-500 mb-3"></i>
          <p>Rol no encontrado</p>
        </div>
      </p-card>

      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .roles-detail-page {
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

    .badge-info {
      background-color: #d1ecf1;
      color: #0c5460;
    }

    .badge-secondary {
      background-color: #e2e3e5;
      color: #383d41;
    }

    .badge-module {
      background-color: #fff3cd;
      color: #856404;
    }
  `],
})
export class RolesDetailPage implements OnInit {
  private rolesService = inject(RolesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  role: Role | null = null;
  loading = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRole(id);
    }
  }

  loadRole(id: string): void {
    this.loading = true;
    this.rolesService.findOne(id).subscribe({
      next: (role) => {
        this.role = role;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el rol',
        });
        this.loading = false;
      },
    });
  }

  goToEdit(): void {
    if (this.role && !this.role.isSystem) {
      this.router.navigate(['/roles', this.role.id, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/roles']);
  }
}
