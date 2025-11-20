import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const PERMISSIONS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./views/permissions-list/permissions-list.component').then((m) => m.PermissionsListComponent),
      },
      {
        path: 'new',
        loadComponent: () => import('./views/permissions-form/permissions-form.component').then((m) => m.PermissionsFormComponent),
      },
      {
        path: ':key',
        loadComponent: () => import('./views/permissions-detail/permissions-detail.component').then((m) => m.PermissionsDetailComponent),
      },
      {
        path: ':key/edit',
        loadComponent: () => import('./views/permissions-form/permissions-form.component').then((m) => m.PermissionsFormComponent),
      },
    ],
  },
];
