import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor funcional que agrega el header Authorization con JWT
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Obtener token de localStorage
  const token = localStorage.getItem('access_token');

  // Si no hay token, continuar sin modificar
  if (!token) {
    return next(req);
  }

  // Clonar request y agregar header Authorization
  const clonedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(clonedRequest);
};
