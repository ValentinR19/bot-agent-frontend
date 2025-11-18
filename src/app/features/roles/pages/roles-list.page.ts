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
import { RolesService } from '../roles.service';
import { Role } from '../role.model';

@Component({
  selector: 'app-roles-list',
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
    <div class="roles-list-page">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-content-between align-items-center p-3">
            <h2>Gestión de Roles</h2>
            <p-button
              label="Nuevo Rol"
              icon="pi pi-plus"
              (onClick)="goToCreate()"
            ></p-button>
          </div>
        </ng-template>

        <p-table
          [value]="roles"
          [loading]="loading"
          [paginator]="true"
          [rows]="10"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} roles"
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
              <th>Permisos</th>
              <th>Sistema</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-role>
            <tr>
              <td>{{ role.name }}</td>
              <td>{{ role.description || '-' }}</td>
              <td>{{ role.permissions?.length || 0 }}</td>
              <td>
                <span
                  [class]="
                    'badge ' + (role.isSystem ? 'badge-info' : 'badge-secondary')
                  "
                >
                  {{ role.isSystem ? 'Sistema' : 'Personalizado' }}
                </span>
              </td>
              <td>
                <span
                  [class]="
                    'badge ' + (role.isActive ? 'badge-success' : 'badge-danger')
                  "
                >
                  {{ role.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td>
                <div class="flex gap-2">
                  <p-button
                    icon="pi pi-eye"
                    [rounded]="true"
                    [text]="true"
                    severity="info"
                    (onClick)="goToDetail(role.id)"
                    pTooltip="Ver detalle"
                  ></p-button>
                  <p-button
                    icon="pi pi-pencil"
                    [rounded]="true"
                    [text]="true"
                    severity="warn"
                    (onClick)="goToEdit(role.id)"
                    pTooltip="Editar"
                    [disabled]="role.isSystem"
                  ></p-button>
                  <p-button
                    icon="pi pi-trash"
                    [rounded]="true"
                    [text]="true"
                    severity="danger"
                    (onClick)="confirmDelete(role)"
                    pTooltip="Eliminar"
                    [disabled]="role.isSystem"
                  ></p-button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center">No se encontraron roles.</td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>

      <p-confirmDialog></p-confirmDialog>
      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .roles-list-page {
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

    .badge-info {
      background-color: #d1ecf1;
      color: #0c5460;
    }

    .badge-secondary {
      background-color: #e2e3e5;
      color: #383d41;
    }
  `],
})
export class RolesListPage implements OnInit {
  private rolesService = inject(RolesService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  roles: Role[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading = true;
    this.rolesService.findAll().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar roles',
        });
        this.loading = false;
      },
    });
  }

  goToCreate(): void {
    this.router.navigate(['/roles/new']);
  }

  goToDetail(id: string): void {
    this.router.navigate(['/roles', id]);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/roles', id, 'edit']);
  }

  confirmDelete(role: Role): void {
    if (role.isSystem) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No se pueden eliminar roles del sistema',
      });
      return;
    }

    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el rol "${role.name}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteRole(role.id);
      },
    });
  }

  deleteRole(id: string): void {
    this.rolesService.delete(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Rol eliminado correctamente',
        });
        this.loadRoles();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al eliminar rol',
        });
      },
    });
  }
}
