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
import { TeamsService } from '../teams.service';
import { Team } from '../team.model';

@Component({
  selector: 'app-teams-detail',
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
    <div class="teams-detail-page">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-content-between align-items-center p-3">
            <h2>Detalle del Equipo</h2>
            <div class="flex gap-2">
              <p-button
                label="Editar"
                icon="pi pi-pencil"
                (onClick)="goToEdit()"
                [disabled]="!team"
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

        <div *ngIf="!loading && team" class="team-details">
          <div class="detail-section">
            <h3>Información General</h3>
            <p-divider></p-divider>

            <div class="detail-grid">
              <div class="detail-item">
                <label>Nombre:</label>
                <span class="value">{{ team.name }}</span>
              </div>

              <div class="detail-item">
                <label>Descripción:</label>
                <span class="value">{{ team.description || '-' }}</span>
              </div>

              <div class="detail-item">
                <label>Estado:</label>
                <span
                  [class]="
                    'badge ' + (team.isActive ? 'badge-success' : 'badge-danger')
                  "
                >
                  {{ team.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </div>

              <div class="detail-item">
                <label>Miembros:</label>
                <span class="value">{{ team.members?.length || 0 }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section" *ngIf="team.members && team.members.length > 0">
            <h3>Miembros del Equipo</h3>
            <p-divider></p-divider>

            <p-table [value]="team.members" [paginator]="true" [rows]="5">
              <ng-template pTemplate="header">
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol en Equipo</th>
                  <th>Fecha de Ingreso</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-member>
                <tr>
                  <td>{{ member.user?.fullName || '-' }}</td>
                  <td>{{ member.user?.email || '-' }}</td>
                  <td>
                    <span [class]="'badge badge-' + getRoleBadgeClass(member.roleInTeam)">
                      {{ getRoleLabel(member.roleInTeam) }}
                    </span>
                  </td>
                  <td>{{ member.createdAt | date: 'dd/MM/yyyy' }}</td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="4" class="text-center">No hay miembros en este equipo.</td>
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
                <span class="value">{{ team.createdAt | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>

              <div class="detail-item">
                <label>Última actualización:</label>
                <span class="value">{{ team.updatedAt | date: 'dd/MM/yyyy HH:mm' }}</span>
              </div>

              <div class="detail-item">
                <label>ID:</label>
                <span class="value text-sm text-gray-500">{{ team.id }}</span>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="!loading && !team" class="text-center p-5">
          <i class="pi pi-exclamation-circle text-4xl text-red-500 mb-3"></i>
          <p>Equipo no encontrado</p>
        </div>
      </p-card>

      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .teams-detail-page {
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

    .badge-owner {
      background-color: #d1ecf1;
      color: #0c5460;
    }

    .badge-admin {
      background-color: #fff3cd;
      color: #856404;
    }

    .badge-member {
      background-color: #e2e3e5;
      color: #383d41;
    }
  `],
})
export class TeamsDetailPage implements OnInit {
  private teamsService = inject(TeamsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  team: Team | null = null;
  loading = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTeam(id);
    }
  }

  loadTeam(id: string): void {
    this.loading = true;
    this.teamsService.findOne(id).subscribe({
      next: (team) => {
        this.team = team;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el equipo',
        });
        this.loading = false;
      },
    });
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      owner: 'Propietario',
      admin: 'Administrador',
      member: 'Miembro',
    };
    return labels[role] || role;
  }

  getRoleBadgeClass(role: string): string {
    return role;
  }

  goToEdit(): void {
    if (this.team) {
      this.router.navigate(['/teams', this.team.id, 'edit']);
    }
  }

  goBack(): void {
    this.router.navigate(['/teams']);
  }
}
