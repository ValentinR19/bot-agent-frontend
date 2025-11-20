import { Routes } from '@angular/router';

export const CATALOG_DETAIL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./catalog-detail.component').then((m) => m.CatalogDetailComponent),
  },
];
