import { Routes } from '@angular/router';

/**
 * Rutas para la vista Login
 */
export const LOGIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./login.component').then((m) => m.LoginComponent),
  },
];
