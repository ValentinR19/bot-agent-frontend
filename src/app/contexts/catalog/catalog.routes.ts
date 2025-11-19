import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const CATALOG_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./views/catalog-list/catalog-list.routes').then((m) => m.CATALOG_LIST_ROUTES),
      },
      {
        path: 'new',
        loadChildren: () => import('./views/catalog-form/catalog-form.routes').then((m) => m.CATALOG_FORM_ROUTES),
      },
      {
        path: ':id',
        loadChildren: () => import('./views/catalog-detail/catalog-detail.routes').then((m) => m.CATALOG_DETAIL_ROUTES),
      },
      {
        path: ':id/edit',
        loadChildren: () => import('./views/catalog-form/catalog-form.routes').then((m) => m.CATALOG_FORM_ROUTES),
      },
    ],
  },
];
