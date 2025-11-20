import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { TenantService } from '../services/tenant.service';

/**
 * Guard para rutas que requieren un tenant activo
 *
 * USO:
 * - Aplicar a rutas tenant-scoped (flows, knowledge, channels, etc.)
 * - NO aplicar a rutas globales (login, perfil, dashboard superadmin, etc.)
 *
 * COMPORTAMIENTO:
 * - Si hay tenant activo → permite acceso
 * - Si NO hay tenant activo → redirige a /select-tenant
 *
 * EJEMPLO:
 * ```ts
 * export const FLOWS_ROUTES: Routes = [
 *   {
 *     path: '',
 *     component: FlowsListComponent,
 *     canActivate: [tenantRequiredGuard],
 *   },
 * ];
 * ```
 */
export const tenantRequiredGuard: CanActivateFn = (): boolean | UrlTree => {
  const tenantService = inject(TenantService);
  const router = inject(Router);

  const hasTenant = tenantService.hasTenant();

  if (!hasTenant) {
    // Redirigir a página de selección de tenant
    // Si el usuario no tiene tenants, debería mostrar un mensaje amigable
    return router.createUrlTree(['/select-tenant']);
  }

  return true;
};
