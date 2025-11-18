import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Interceptor funcional que agrega el header X-Tenant-Id a todas las requests
 * IMPORTANTE: Este interceptor es crítico para el multi-tenancy
 */
export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  // Solo agregar header si existe tenantId en environment
  if (!environment.tenantId) {
    return next(req);
  }

  // Clonar request y agregar header
  const clonedRequest = req.clone({
    setHeaders: {
      'X-Tenant-Id': environment.tenantId
    }
  });

  return next(clonedRequest);
};
