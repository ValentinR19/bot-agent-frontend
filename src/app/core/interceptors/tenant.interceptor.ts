import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TenantService } from '../services/tenant.service';

/**
 * Interceptor funcional que agrega el header X-Tenant-Id a requests tenant-scoped
 *
 * MULTI-TENANT INTERCEPTOR:
 * - Agrega X-Tenant-Id automáticamente desde TenantService
 * - Excluye endpoints GLOBALES que NO deben llevar tenant:
 *   - /auth/login, /auth/register, /auth/me, /auth/refresh
 *   - /auth/my-tenants (lista de tenants del usuario)
 *   - Endpoints de superadmin globales
 *
 * IMPORTANTE: Los endpoints tenant-scoped en el backend validan que el header esté presente
 */
export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const tenantService = inject(TenantService);

  // Lista de endpoints GLOBALES que NO deben llevar X-Tenant-Id
  const globalEndpoints = [
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    '/auth/me',
    '/auth/my-tenants',
    '/auth/logout',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email',
    '/auth/change-password',
  ];

  // Verificar si el endpoint es global
  const isGlobalEndpoint = globalEndpoints.some((endpoint) => req.url.includes(endpoint));

  // Si es endpoint global, NO agregar header
  if (isGlobalEndpoint) {
    return next(req);
  }

  // Obtener tenant activo
  const currentTenantId = tenantService.getCurrentTenantId();

  // Si no hay tenant activo, NO agregar header
  // (el guard TenantRequiredGuard se encargará de bloquear rutas que lo requieran)
  if (!currentTenantId) {
    return next(req);
  }

  // Agregar header X-Tenant-Id para endpoints tenant-scoped
  const clonedRequest = req.clone({
    setHeaders: {
      'X-Tenant-Id': currentTenantId,
    },
  });

  return next(clonedRequest);
};
