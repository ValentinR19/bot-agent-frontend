import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TenantService } from '../services/tenant.service';

/**
 * Interceptor funcional que agrega el header X-Tenant-Id a todas las requests
 * IMPORTANTE: Este interceptor es crítico para el multi-tenancy
 *
 * El tenantId se obtiene dinámicamente desde TenantService, que puede contener:
 * - El tenantId del usuario logueado
 * - El tenantId seleccionado por un admin
 */
export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const tenantService = inject(TenantService);
  const currentTenantId = tenantService.getCurrentTenantId();

  // Solo agregar header si existe tenantId
  if (!currentTenantId) {
    return next(req);
  }

  // Clonar request y agregar header
  const clonedRequest = req.clone({
    setHeaders: {
      'X-Tenant-Id': currentTenantId,
    },
  });

  return next(clonedRequest);
};
