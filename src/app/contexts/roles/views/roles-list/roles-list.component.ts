import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { RolesService } from '../../services/roles.service';
import { Role } from '../../models/role.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import {
  CustomTableComponent,
  TableColumn,
  TableAction,
} from '../../../../shared/components/custom-table/custom-table.component';
import { FilterPanelComponent } from '../../../../shared/components/filter-panel/filter-panel.component';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    CustomTableComponent,
    FilterPanelComponent,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './roles-list.component.html',
  styleUrl: './roles-list.component.scss',
})
export class RolesListComponent implements OnInit, OnDestroy {
  private readonly rolesService = inject(RolesService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly destroy$ = new Subject<void>();

  roles: Role[] = [];
  loading = false;
  searchText = '';

  columns: TableColumn[] = [
    { field: 'name', header: 'Nombre', sortable: true, filterable: true },
    { field: 'code', header: 'Código', sortable: true, filterable: true },
    { field: 'description', header: 'Descripción', sortable: true },
    { field: 'isSystem', header: 'Sistema', sortable: true, type: 'boolean' },
    { field: 'isActive', header: 'Activo', sortable: true, type: 'boolean' },
    { field: 'createdAt', header: 'Fecha de Creación', sortable: true, type: 'date' },
  ];

  actions: TableAction[] = [
    {
      label: 'Ver',
      icon: 'pi pi-eye',
      severity: 'info',
      command: (role: Role) => this.viewRole(role),
    },
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      severity: 'primary',
      command: (role: Role) => this.editRole(role),
    },
    {
      label: 'Eliminar',
      icon: 'pi pi-trash',
      severity: 'danger',
      command: (role: Role) => this.deleteRole(role),
    },
  ];

  ngOnInit(): void {
    this.loadRoles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRoles(): void {
    this.loading = true;
    this.rolesService
      .findAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (roles) => {
          this.roles = roles;
          this.loading = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los roles',
          });
          this.loading = false;
        },
      });
  }

  onSearch(searchText: string): void {
    this.searchText = searchText;
    // TODO: Implementar búsqueda en el backend o filtrar localmente
  }

  createRole(): void {
    this.router.navigate(['/roles/new']);
  }

  viewRole(role: Role): void {
    this.router.navigate(['/roles', role.id]);
  }

  editRole(role: Role): void {
    this.router.navigate(['/roles', role.id, 'edit']);
  }

  deleteRole(role: Role): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar el rol "${role.name}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.rolesService
          .delete(role.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Rol eliminado correctamente',
              });
              this.loadRoles();
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo eliminar el rol',
              });
            },
          });
      },
    });
  }
}
