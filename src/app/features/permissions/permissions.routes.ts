import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const PERMISSIONS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/permissions-list.page').then((m) => m.PermissionsListPage),
      },
      {
        path: 'new',
        loadComponent: () => import('./pages/permissions-form.page').then((m) => m.PermissionsFormPage),
      },
      {
        path: ':key',
        loadComponent: () => import('./pages/permissions-detail.page').then((m) => m.PermissionsDetailPage),
      },
      {
        path: ':key/edit',
        loadComponent: () => import('./pages/permissions-form.page').then((m) => m.PermissionsFormPage),
      },
    ],
  },
];
