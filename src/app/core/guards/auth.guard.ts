import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';

/**
 * Guard funcional que protege rutas autenticadas
 * Verifica si existe un JWT válido en localStorage
 */
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('access_token');

  if (!token) {
    // No hay token, redirigir a login
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  // TODO: Opcionalmente, validar si el token está expirado
  // Esto requeriría decodificar el JWT y verificar la fecha de expiración

  return true;
};
