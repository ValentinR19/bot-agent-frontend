import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthUserTenant } from '../../contexts/auth/models/auth.model';

/**
 * Servicio para gestionar el contexto multi-tenant
 *
 * MULTI-TENANT CONTEXT:
 * - Un usuario puede tener N tenants asignados
 * - El usuario selecciona un tenant "activo" desde el frontend
 * - El tenant activo se usa en el TenantInterceptor para agregar X-Tenant-Id
 * - SuperAdmins pueden:
 *   - Ver pantallas globales sin tenant
 *   - Seleccionar un tenant para operar dentro de él
 *
 * FLUJO:
 * 1. Login → AuthService llama initFromAuth() con la lista de tenants
 * 2. Se selecciona tenant por defecto o el primero disponible
 * 3. Usuario puede cambiar tenant activo desde UI
 * 4. TenantInterceptor lee el tenant activo y agrega header
 */
@Injectable({
  providedIn: 'root',
})
export class TenantService {
  private readonly STORAGE_KEY = 'active_tenant_id';

  // Tenant activo (el que se usa para X-Tenant-Id)
  private activeTenantIdSubject = new BehaviorSubject<string | null>(this.getTenantIdFromStorage());
  public currentTenantId$ = this.activeTenantIdSubject.asObservable();

  // Lista de tenants del usuario autenticado
  private userTenantsSubject = new BehaviorSubject<AuthUserTenant[]>([]);
  public userTenants$ = this.userTenantsSubject.asObservable();

  /**
   * Inicializa el contexto de tenants después del login
   * @param tenants - Lista de tenants del usuario
   * @param defaultTenantId - Tenant por defecto (opcional)
   */
  initFromAuth(tenants: AuthUserTenant[], defaultTenantId?: string | null): void {
    this.userTenantsSubject.next(tenants);

    // Determinar tenant activo:
    // 1. Tenant guardado en localStorage (si sigue siendo válido)
    // 2. defaultTenantId del usuario
    // 3. Primer tenant de la lista
    // 4. null (para superadmins sin tenant)
    const storedTenantId = this.getTenantIdFromStorage();
    const isStoredValid = storedTenantId && tenants.some((t) => t.id === storedTenantId);

    let activeTenantId: string | null = null;

    if (isStoredValid) {
      activeTenantId = storedTenantId;
    } else if (defaultTenantId && tenants.some((t) => t.id === defaultTenantId)) {
      activeTenantId = defaultTenantId;
    } else if (tenants.length > 0) {
      activeTenantId = tenants[0].id;
    }

    this.setActiveTenant(activeTenantId, false);
  }

  /**
   * Establece el tenant activo
   * @param tenantId - ID del tenant a activar
   * @param persist - Si se debe guardar en localStorage (default: true)
   */
  setActiveTenant(tenantId: string | null, persist = true): void {
    // Validar que el tenant esté en la lista del usuario
    if (tenantId) {
      const isValid = this.userTenantsSubject.value.some((t) => t.id === tenantId);
      if (!isValid) {
        console.warn(`Tenant ${tenantId} no está en la lista del usuario`);
        return;
      }
    }

    this.activeTenantIdSubject.next(tenantId);

    if (persist) {
      if (tenantId) {
        localStorage.setItem(this.STORAGE_KEY, tenantId);
      } else {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }
  }

  /**
   * Obtiene el tenant activo actual
   */
  getCurrentTenantId(): string | null {
    return this.activeTenantIdSubject.value;
  }

  /**
   * Obtiene la lista de tenants del usuario
   */
  getUserTenants(): AuthUserTenant[] {
    return this.userTenantsSubject.value;
  }

  /**
   * Obtiene el tenant activo completo (con nombre y rol)
   */
  getActiveTenant(): AuthUserTenant | null {
    const activeId = this.getCurrentTenantId();
    if (!activeId) return null;

    return this.userTenantsSubject.value.find((t) => t.id === activeId) || null;
  }

  /**
   * Verifica si hay un tenant seleccionado
   */
  hasTenant(): boolean {
    return !!this.getCurrentTenantId();
  }

  /**
   * Limpia todo el contexto de tenant (usar en logout)
   */
  clearCurrentTenantId(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.activeTenantIdSubject.next(null);
    this.userTenantsSubject.next([]);
  }

  /**
   * Obtiene el tenantId desde localStorage
   */
  private getTenantIdFromStorage(): string | null {
    return localStorage.getItem(this.STORAGE_KEY);
  }
}
