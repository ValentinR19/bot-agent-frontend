import { Routes } from '@angular/router';

export const CATALOG_FORM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./catalog-form.component').then((m) => m.CatalogFormComponent),
  },
];
