import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const DESTINATIONS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/destinations-list.page').then((m) => m.DestinationsListPage),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/destinations-form.page').then((m) => m.DestinationsFormPage),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/destinations-detail.page').then((m) => m.DestinationsDetailPage),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./pages/destinations-form.page').then((m) => m.DestinationsFormPage),
      },
    ],
  },
];
