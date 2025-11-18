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
import { UsersService } from '../users.service';
import { User } from '../user.model';

@Component({
  selector: 'app-users-list',
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
    <div class="users-list-page">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-content-between align-items-center p-3">
            <h2>Gestión de Usuarios</h2>
            <p-button
              label="Nuevo Usuario"
              icon="pi pi-plus"
              (onClick)="goToCreate()"
            ></p-button>
          </div>
        </ng-template>

        <p-table
          [value]="users"
          [loading]="loading"
          [paginator]="true"
          [rows]="10"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
          [rowsPerPageOptions]="[10, 25, 50]"
          [globalFilterFields]="['fullName', 'email']"
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
              <th pSortableColumn="fullName">
                Nombre <p-sortIcon field="fullName"></p-sortIcon>
              </th>
              <th pSortableColumn="email">
                Email <p-sortIcon field="email"></p-sortIcon>
              </th>
              <th>Super Admin</th>
              <th>Estado</th>
              <th>Último acceso</th>
              <th>Acciones</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-user>
            <tr>
              <td>{{ user.fullName }}</td>
              <td>
                <span class="text-primary font-semibold">{{ user.email }}</span>
              </td>
              <td>
                <span
                  [class]="
                    'badge ' + (user.isSuperAdmin ? 'badge-warning' : 'badge-secondary')
                  "
                >
                  {{ user.isSuperAdmin ? 'Sí' : 'No' }}
                </span>
              </td>
              <td>
                <span
                  [class]="
                    'badge ' + (user.isActive ? 'badge-success' : 'badge-danger')
                  "
                >
                  {{ user.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td>{{ user.lastLoginAt ? (user.lastLoginAt | date: 'dd/MM/yyyy HH:mm') : 'Nunca' }}</td>
              <td>
                <div class="flex gap-2">
                  <p-button
                    icon="pi pi-eye"
                    [rounded]="true"
                    [text]="true"
                    severity="info"
                    (onClick)="goToDetail(user.id)"
                    pTooltip="Ver detalle"
                  ></p-button>
                  <p-button
                    icon="pi pi-pencil"
                    [rounded]="true"
                    [text]="true"
                    severity="warn"
                    (onClick)="goToEdit(user.id)"
                    pTooltip="Editar"
                  ></p-button>
                  <p-button
                    icon="pi pi-trash"
                    [rounded]="true"
                    [text]="true"
                    severity="danger"
                    (onClick)="confirmDelete(user)"
                    pTooltip="Eliminar"
                  ></p-button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center">No se encontraron usuarios.</td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>

      <p-confirmDialog></p-confirmDialog>
      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .users-list-page {
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

    .badge-warning {
      background-color: #fff3cd;
      color: #856404;
    }

    .badge-secondary {
      background-color: #e2e3e5;
      color: #383d41;
    }
  `],
})
export class UsersListPage implements OnInit {
  private usersService = inject(UsersService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  users: User[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.usersService.findAll().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar usuarios',
        });
        this.loading = false;
      },
    });
  }

  goToCreate(): void {
    this.router.navigate(['/users/new']);
  }

  goToDetail(id: string): void {
    this.router.navigate(['/users', id]);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/users', id, 'edit']);
  }

  confirmDelete(user: User): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el usuario "${user.fullName}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteUser(user.id);
      },
    });
  }

  deleteUser(id: string): void {
    this.usersService.delete(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Usuario eliminado correctamente',
        });
        this.loadUsers();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al eliminar usuario',
        });
      },
    });
  }
}
