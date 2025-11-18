import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const TENANTS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/tenants-list/tenants-list.page').then(
            (m) => m.TenantsListPage
          )
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/tenants-form/tenants-form.page').then(
            (m) => m.TenantsFormPage
          )
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/tenants-detail/tenants-detail.page').then(
            (m) => m.TenantsDetailPage
          )
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./pages/tenants-form/tenants-form.page').then(
            (m) => m.TenantsFormPage
          )
      }
    ]
  }
];
