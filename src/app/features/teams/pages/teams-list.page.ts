import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TeamsService } from '../teams.service';
import { Team } from '../team.model';

@Component({
  selector: 'app-teams-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="teams-list-page">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-content-between align-items-center p-3">
            <h2>Gestión de Equipos</h2>
            <p-button
              label="Nuevo Equipo"
              icon="pi pi-plus"
              (onClick)="goToCreate()"
            ></p-button>
          </div>
        </ng-template>

        <p-table
          [value]="teams"
          [loading]="loading"
          [paginator]="true"
          [rows]="10"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} equipos"
          [rowsPerPageOptions]="[10, 25, 50]"
          [globalFilterFields]="['name', 'description']"
          #dt
        >
          <ng-template pTemplate="caption">
            <div class="flex">
              <span class="p-input-icon-left ml-auto">
                <i class="pi pi-search"></i>
                <input
                  pInputText
                  type="text"
                  (input)="dt.filterGlobal($any($event.target).value, 'contains')"
                  placeholder="Buscar..."
                />
              </span>
            </div>
          </ng-template>

          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="name">
                Nombre <p-sortIcon field="name"></p-sortIcon>
              </th>
              <th>Descripción</th>
              <th>Miembros</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-team>
            <tr>
              <td>{{ team.name }}</td>
              <td>{{ team.description || '-' }}</td>
              <td>{{ team.members?.length || 0 }}</td>
              <td>
                <span
                  [class]="
                    'badge ' + (team.isActive ? 'badge-success' : 'badge-danger')
                  "
                >
                  {{ team.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td>
                <div class="flex gap-2">
                  <p-button
                    icon="pi pi-eye"
                    [rounded]="true"
                    [text]="true"
                    severity="info"
                    (onClick)="goToDetail(team.id)"
                    pTooltip="Ver detalle"
                  ></p-button>
                  <p-button
                    icon="pi pi-pencil"
                    [rounded]="true"
                    [text]="true"
                    severity="warn"
                    (onClick)="goToEdit(team.id)"
                    pTooltip="Editar"
                  ></p-button>
                  <p-button
                    icon="pi pi-trash"
                    [rounded]="true"
                    [text]="true"
                    severity="danger"
                    (onClick)="confirmDelete(team)"
                    pTooltip="Eliminar"
                  ></p-button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="5" class="text-center">No se encontraron equipos.</td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>

      <p-confirmDialog></p-confirmDialog>
      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .teams-list-page {
      padding: 1.5rem;
    }

    .badge {
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
  `],
})
export class TeamsListPage implements OnInit {
  private teamsService = inject(TeamsService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  teams: Team[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams(): void {
    this.loading = true;
    this.teamsService.findAll().subscribe({
      next: (teams) => {
        this.teams = teams;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar equipos',
        });
        this.loading = false;
      },
    });
  }

  goToCreate(): void {
    this.router.navigate(['/teams/new']);
  }

  goToDetail(id: string): void {
    this.router.navigate(['/teams', id]);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/teams', id, 'edit']);
  }

  confirmDelete(team: Team): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el equipo "${team.name}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteTeam(team.id);
      },
    });
  }

  deleteTeam(id: string): void {
    this.teamsService.delete(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Equipo eliminado correctamente',
        });
        this.loadTeams();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al eliminar equipo',
        });
      },
    });
  }
}
