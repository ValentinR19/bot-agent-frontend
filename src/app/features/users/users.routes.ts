import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/users-list/users-list.page').then(
            (m) => m.UsersListPage
          )
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/users-list/users-list.page').then(
            (m) => m.UsersListPage
          )
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/users-list/users-list.page').then(
            (m) => m.UsersListPage
          )
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./pages/users-list/users-list.page').then(
            (m) => m.UsersListPage
          )
      }
    ]
  }
];
