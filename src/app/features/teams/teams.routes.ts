import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const TEAMS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/teams-list.page').then((m) => m.TeamsListPage),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/teams-form.page').then((m) => m.TeamsFormPage),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/teams-detail.page').then((m) => m.TeamsDetailPage),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./pages/teams-form.page').then((m) => m.TeamsFormPage),
      },
    ],
  },
];
