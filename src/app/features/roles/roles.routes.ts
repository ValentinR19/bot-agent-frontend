import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const ROLES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/roles-list/roles-list.page').then(
            (m) => m.RolesListPage
          )
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/roles-list/roles-list.page').then(
            (m) => m.RolesListPage
          )
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/roles-list/roles-list.page').then(
            (m) => m.RolesListPage
          )
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./pages/roles-list/roles-list.page').then(
            (m) => m.RolesListPage
          )
      }
    ]
  }
];
