import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { UsersService } from '../users.service';
import { User } from '../user.model';

@Component({
  selector: 'app-users-detail',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, DividerModule, SkeletonModule, ToastModule],
  providers: [MessageService],
  template: `
    <div class="users-detail-page">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-content-between align-items-center p-3">
            <h2>Detalle del Usuario</h2>
            <div class="flex gap-2">
              <p-button label="Editar" icon="pi pi-pencil" (onClick)="goToEdit()" [disabled]="!user"></p-button>
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

        <div *ngIf="!loading && user" class="user-details">
          <div class="detail-section">
            <h3>Información General</h3>
            <p-divider></p-divider>

            <div class="detail-grid">
              <div class="detail-item">
                <label>Nombre Completo:</label>
                <span class="value">{{ user.fullName }}</span>
              </div>

              <div class="detail-item">
                <label>Email:</label>
                <span class="value text-primary font-semibold">{{ user.email }}</span>
              </div>

              <div class="detail-item">
                <label>Avatar:</label>
                <span class="value">
                  <img *ngIf="user.avatarUrl" [src]="user.avatarUrl" alt="Avatar" class="avatar-img" />
                  <span *ngIf="!user.avatarUrl">Sin avatar</span>
                </span>
              </div>

              <div class="detail-item">
                <label>Super Admin:</label>
                <span [class]="'badge ' + (user.isSuperAdmin ? 'badge-warning' : 'badge-secondary')">
                  {{ user.isSuperAdmin ? 'Sí' : 'No' }}
                </span>
              </div>

              <div class="detail-item">
                <label>Estado:</label>
                <span [class]="'badge ' + (user.isActive ? 'badge-success' : 'badge-danger')">
                  {{ user.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </div>

              <div class="detail-item">
                <label>Último Acceso:</label>
                <span class="value">{{ user.lastLoginAt ? (user.lastLoginAt | date: 'dd/MM/yyyy HH:mm') : 'Nunca' }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h3>Metadatos</h3>
            <p-divider></p-divider>

            <div class="detail-grid">
              <div class="detail-item">
                <label>Creado:</label>
                <span class="value">{{ user.createdAt | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>

              <div class="detail-item">
                <label>Última actualización:</label>
                <span class="value">{{ user.updatedAt | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>

              <div class="detail-item">
                <label>ID:</label>
                <span class="value text-sm text-gray-500">{{ user.id }}</span>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="!loading && !user" class="text-center p-5">
          <i class="pi pi-exclamation-circle text-4xl text-red-500 mb-3"></i>
          <p>Usuario no encontrado</p>
        </div>
      </p-card>

      <p-toast></p-toast>
    </div>
  `,
  styles: [
    `
      .users-detail-page {
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

      .badge-warning {
        background-color: #fff3cd;
        color: #856404;
      }

      .badge-secondary {
        background-color: #e2e3e5;
        color: #383d41;
      }

      .avatar-img {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        object-fit: cover;
      }
    `,
  ],
})
export class UsersDetailPage implements OnInit {
  private usersService = inject(UsersService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  user: User | null = null;
  loading = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadUser(id);
    }
  }

  loadUser(id: string): void {
    this.loading = true;
    this.usersService.findOne(id).subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el usuario',
        });
        this.loading = false;
      },
    });
  }

  goToEdit(): void {
    if (this.user) {
      this.router.navigate(['/users', this.user.id, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}
