import { Routes } from '@angular/router';

export const DESTINATIONS_FORM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./destinations-form.component').then((m) => m.DestinationsFormComponent),
  },
];
