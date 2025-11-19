import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpService } from '../../../core/http/http.service';
import {
  Role,
  CreateRoleDto,
  UpdateRoleDto,
  Permission,
  AssignRoleDto,
  AssignPermissionDto,
} from '../models/role.model';

/**
 * Servicio para gestión de Roles (RBAC)
 * Endpoints generados desde swagger-export.json
 */
@Injectable({
  providedIn: 'root',
})
export class RolesService {
  private readonly http = inject(HttpService);
  private readonly baseUrl = '/api/v1/roles';

  // Estado interno (mini-store)
  private rolesSubject = new BehaviorSubject<Role[]>([]);
  public roles$ = this.rolesSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  /**
   * GET /api/v1/roles
   * Listar todos los roles
   */
  findAll(): Observable<Role[]> {
    this.loadingSubject.next(true);

    return this.http.get<Role[]>(this.baseUrl).pipe(
      tap({
        next: (roles) => {
          this.rolesSubject.next(roles);
          this.loadingSubject.next(false);
        },
        error: () => {
          this.loadingSubject.next(false);
        },
      }),
    );
  }

  /**
   * GET /api/v1/roles/{id}
   * Obtener un rol por ID
   */
  findOne(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.baseUrl}/${id}`);
  }

  /**
   * POST /api/v1/roles
   * Crear un nuevo rol
   */
  create(dto: CreateRoleDto): Observable<Role> {
    return this.http.post<Role>(this.baseUrl, dto).pipe(
      tap((newRole) => {
        const currentRoles = this.rolesSubject.value;
        this.rolesSubject.next([...currentRoles, newRole]);
      }),
    );
  }

  /**
   * PUT /api/v1/roles/{id}
   * Actualizar un rol
   */
  update(id: string, dto: UpdateRoleDto): Observable<Role> {
    return this.http.put<Role>(`${this.baseUrl}/${id}`, dto).pipe(
      tap((updatedRole) => {
        const currentRoles = this.rolesSubject.value;
        const index = currentRoles.findIndex((r) => r.id === id);
        if (index !== -1) {
          currentRoles[index] = updatedRole;
          this.rolesSubject.next([...currentRoles]);
        }
      }),
    );
  }

  /**
   * DELETE /api/v1/roles/{id}
   * Eliminar un rol (soft delete)
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        const currentRoles = this.rolesSubject.value;
        this.rolesSubject.next(currentRoles.filter((r) => r.id !== id));
      }),
    );
  }

  /**
   * GET /api/v1/roles/{id}/permissions
   * Obtener permisos de un rol
   */
  getRolePermissions(id: string): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.baseUrl}/${id}/permissions`);
  }

  /**
   * POST /api/v1/roles/{id}/permissions
   * Agregar permiso a un rol
   */
  addPermission(roleId: string, dto: AssignPermissionDto): Observable<Permission> {
    return this.http.post<Permission>(`${this.baseUrl}/${roleId}/permissions`, dto);
  }

  /**
   * DELETE /api/v1/roles/{roleId}/permissions/{permissionKey}
   * Remover permiso de un rol
   */
  removePermission(roleId: string, permissionKey: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${roleId}/permissions/${permissionKey}`);
  }

  /**
   * POST /api/v1/roles/assign
   * Asignar rol a usuario
   */
  assignRole(dto: AssignRoleDto): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/assign`, dto);
  }

  /**
   * DELETE /api/v1/roles/users/{userId}/roles/{roleId}
   * Remover rol de usuario
   */
  removeRoleFromUser(userId: string, roleId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${userId}/roles/${roleId}`);
  }
}
