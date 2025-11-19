import { Routes } from '@angular/router';

/**
 * Rutas principales del contexto Auth
 */
export const AUTH_ROUTES: Routes = [
  {
    path: '',
    children: [
      {
        path: 'login',
        loadChildren: () => import('./views/login/login.routes').then((m) => m.LOGIN_ROUTES),
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
];
