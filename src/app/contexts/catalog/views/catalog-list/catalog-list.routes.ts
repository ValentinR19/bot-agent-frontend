import { Routes } from '@angular/router';

export const CATALOG_LIST_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./catalog-list.component').then((m) => m.CatalogListComponent),
  },
];
