import { Routes } from '@angular/router';

/**
 * Rutas del contexto Tenants
 * Arquitectura: contexts/tenants/
 */
export const TENANTS_ROUTES: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./views/tenants-list/tenants-list.routes').then((m) => m.TENANTS_LIST_ROUTES),
  },
  {
    path: 'new',
    loadChildren: () =>
      import('./views/tenants-form/tenants-form.routes').then((m) => m.TENANTS_FORM_ROUTES),
  },
  {
    path: ':id',
    loadChildren: () =>
      import('./views/tenants-detail/tenants-detail.routes').then((m) => m.TENANTS_DETAIL_ROUTES),
  },
  {
    path: ':id/edit',
    loadChildren: () =>
      import('./views/tenants-form/tenants-form.routes').then((m) => m.TENANTS_FORM_ROUTES),
  },
];
