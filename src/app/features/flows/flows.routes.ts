import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const FLOWS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/flows-list/flows-list.page').then(
            (m) => m.FlowsListPage
          )
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/flows-list/flows-list.page').then(
            (m) => m.FlowsListPage
          )
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/flows-list/flows-list.page').then(
            (m) => m.FlowsListPage
          )
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./pages/flows-list/flows-list.page').then(
            (m) => m.FlowsListPage
          )
      }
    ]
  }
];
