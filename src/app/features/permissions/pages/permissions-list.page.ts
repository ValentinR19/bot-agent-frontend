import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PermissionsService } from '../permissions.service';
import { PermissionCatalog } from '../permission.model';

@Component({
  selector: 'app-permissions-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    TagModule,
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="permissions-list-page">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-content-between align-items-center p-3">
            <h2>Catálogo de Permisos</h2>
            <div class="flex gap-2">
              <p-button
                label="Seed Permisos"
                icon="pi pi-database"
                severity="help"
                (onClick)="seedPermissions()"
              ></p-button>
              <p-button
                label="Nuevo Permiso"
                icon="pi pi-plus"
                (onClick)="goToCreate()"
              ></p-button>
            </div>
          </div>
        </ng-template>

        <p-table
          [value]="permissions"
          [loading]="loading"
          [paginator]="true"
          [rows]="10"
          [showCurrentPageReport]="true"
          currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} permisos"
          [rowsPerPageOptions]="[10, 25, 50]"
          [globalFilterFields]="['key', 'description', 'module']"
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
              <th pSortableColumn="key">
                Clave <p-sortIcon field="key"></p-sortIcon>
              </th>
              <th>Descripción</th>
              <th pSortableColumn="module">
                Módulo <p-sortIcon field="module"></p-sortIcon>
              </th>
              <th pSortableColumn="isActive">
                Estado <p-sortIcon field="isActive"></p-sortIcon>
              </th>
              <th>Acciones</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-permission>
            <tr>
              <td>
                <span class="text-primary font-semibold font-mono">{{ permission.key }}</span>
              </td>
              <td>{{ permission.description }}</td>
              <td>
                <p-tag [value]="permission.module" severity="info"></p-tag>
              </td>
              <td>
                <p-tag
                  [value]="permission.isActive ? 'Activo' : 'Inactivo'"
                  [severity]="permission.isActive ? 'success' : 'danger'"
                ></p-tag>
              </td>
              <td>
                <div class="flex gap-2">
                  <p-button
                    icon="pi pi-eye"
                    [rounded]="true"
                    [text]="true"
                    severity="info"
                    (onClick)="goToDetail(permission.key)"
                    pTooltip="Ver detalle"
                  ></p-button>
                  <p-button
                    icon="pi pi-pencil"
                    [rounded]="true"
                    [text]="true"
                    severity="warning"
                    (onClick)="goToEdit(permission.key)"
                    pTooltip="Editar"
                  ></p-button>
                  <p-button
                    icon="pi pi-trash"
                    [rounded]="true"
                    [text]="true"
                    severity="danger"
                    (onClick)="confirmDelete(permission)"
                    pTooltip="Eliminar"
                  ></p-button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="5" class="text-center">No se encontraron permisos.</td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>

      <p-confirmDialog></p-confirmDialog>
      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .permissions-list-page {
      padding: 1.5rem;
    }

    .font-mono {
      font-family: 'Courier New', monospace;
    }
  `],
})
export class PermissionsListPage implements OnInit {
  private permissionsService = inject(PermissionsService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  permissions: PermissionCatalog[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadPermissions();
  }

  loadPermissions(): void {
    this.loading = true;
    this.permissionsService.getPermissions().subscribe({
      next: (permissions) => {
        this.permissions = permissions;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar permisos',
        });
        this.loading = false;
      },
    });
  }

  seedPermissions(): void {
    this.confirmationService.confirm({
      message: '¿Está seguro de ejecutar el seed de permisos por defecto? Esto puede crear nuevos permisos.',
      header: 'Confirmar Seed',
      icon: 'pi pi-info-circle',
      accept: () => {
        this.permissionsService.seedDefaultPermissions().subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Permisos por defecto creados correctamente',
            });
            this.loadPermissions();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al ejecutar seed de permisos',
            });
          },
        });
      },
    });
  }

  goToCreate(): void {
    this.router.navigate(['/permissions/new']);
  }

  goToDetail(key: string): void {
    this.router.navigate(['/permissions', key]);
  }

  goToEdit(key: string): void {
    this.router.navigate(['/permissions', key, 'edit']);
  }

  confirmDelete(permission: PermissionCatalog): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el permiso "${permission.key}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deletePermission(permission.key);
      },
    });
  }

  deletePermission(key: string): void {
    this.permissionsService.deletePermission(key).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Permiso eliminado correctamente',
        });
        this.loadPermissions();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al eliminar permiso',
        });
      },
    });
  }
}
