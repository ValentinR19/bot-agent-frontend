import { Component, OnInit, OnDestroy, inject } from '@angular/core';
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
import { Subject, takeUntil } from 'rxjs';
import { PermissionsService } from '../../services/permissions.service';
import { PermissionCatalog } from '../../models/permission.model';

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
  templateUrl: './permissions-list.component.html',
  styleUrl: './permissions-list.component.scss',
})
export class PermissionsListComponent implements OnInit, OnDestroy {
  private permissionsService = inject(PermissionsService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private destroy$ = new Subject<void>();

  permissions: PermissionCatalog[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadPermissions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPermissions(): void {
    this.loading = true;
    this.permissionsService
      .getPermissions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
        this.permissionsService
          .seedDefaultPermissions()
          .pipe(takeUntil(this.destroy$))
          .subscribe({
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
    this.permissionsService
      .deletePermission(key)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
