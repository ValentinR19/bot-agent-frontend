import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

/**
 * Interceptor funcional que maneja errores HTTP globalmente
 * - Si es 401: Redirige a /auth/login
 * - Normaliza todos los errores a un formato consistente
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      // Si es error 401, redirigir a login
      if (error.status === 401) {
        // Limpiar token
        localStorage.removeItem('access_token');

        // Redirigir a login
        router.navigate(['/auth/login']);
      }

      // Normalizar error
      const normalizedError = {
        message: error.error?.message || error.message || 'Error desconocido',
        statusCode: error.status || 0,
        error: error.error?.error || error.statusText || 'UNKNOWN_ERROR',
        timestamp: error.error?.timestamp || new Date().toISOString(),
        path: error.error?.path || error.url || 'unknown'
      };

      console.error('[HTTP Error]', normalizedError);

      return throwError(() => normalizedError);
    })
  );
};
