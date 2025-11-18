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
          import('./pages/users-list.page').then((m) => m.UsersListPage),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/users-form.page').then((m) => m.UsersFormPage),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/users-detail.page').then((m) => m.UsersDetailPage),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./pages/users-form.page').then((m) => m.UsersFormPage),
      },
    ],
  },
];
