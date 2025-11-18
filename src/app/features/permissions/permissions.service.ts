import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PermissionCatalog, CreatePermissionDto, UpdatePermissionDto } from './permission.model';

/**
 * Servicio para gestionar el catálogo de permisos
 * Endpoints: /api/v1/permissions
 * Requiere header X-Tenant-Id (manejado por interceptor)
 */
@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private readonly apiUrl = `${environment.apiUrl}/permissions`;

  constructor(private http: HttpClient) {}

  /**
   * Listar todos los permisos
   * GET /api/v1/permissions
   */
  getPermissions(): Observable<PermissionCatalog[]> {
    return this.http.get<PermissionCatalog[]>(this.apiUrl);
  }

  /**
   * Obtener un permiso por key
   * GET /api/v1/permissions/{key}
   */
  getPermissionByKey(key: string): Observable<PermissionCatalog> {
    return this.http.get<PermissionCatalog>(`${this.apiUrl}/${key}`);
  }

  /**
   * Listar permisos por módulo
   * GET /api/v1/permissions/modules/{module}
   */
  getPermissionsByModule(module: string): Observable<PermissionCatalog[]> {
    return this.http.get<PermissionCatalog[]>(`${this.apiUrl}/modules/${module}`);
  }

  /**
   * Crear un nuevo permiso
   * POST /api/v1/permissions
   */
  createPermission(dto: CreatePermissionDto): Observable<PermissionCatalog> {
    return this.http.post<PermissionCatalog>(this.apiUrl, dto);
  }

  /**
   * Actualizar un permiso
   * PUT /api/v1/permissions/{key}
   */
  updatePermission(key: string, dto: UpdatePermissionDto): Observable<PermissionCatalog> {
    return this.http.put<PermissionCatalog>(`${this.apiUrl}/${key}`, dto);
  }

  /**
   * Eliminar un permiso
   * DELETE /api/v1/permissions/{key}
   */
  deletePermission(key: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${key}`);
  }

  /**
   * Seed de permisos por defecto
   * POST /api/v1/permissions/seed
   */
  seedDefaultPermissions(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/seed`, {});
  }
}
