import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const CATALOG_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/catalog-list/catalog-list.page').then(
            (m) => m.CatalogListPage
          )
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/catalog-list/catalog-list.page').then(
            (m) => m.CatalogListPage
          )
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/catalog-list/catalog-list.page').then(
            (m) => m.CatalogListPage
          )
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./pages/catalog-list/catalog-list.page').then(
            (m) => m.CatalogListPage
          )
      }
    ]
  }
];
