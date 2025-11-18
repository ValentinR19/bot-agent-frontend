import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const FLOWS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/flows-list.page').then((m) => m.FlowsListPage),
      },
      {
        path: 'new',
        loadComponent: () => import('./pages/flows-form.page').then((m) => m.FlowsFormPage),
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/flows-detail.page').then((m) => m.FlowsDetailPage),
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./pages/flows-form.page').then((m) => m.FlowsFormPage),
      },
    ],
  },
];
