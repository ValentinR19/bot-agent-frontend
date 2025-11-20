import { Routes } from '@angular/router';

export const DESTINATIONS_DETAIL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./destinations-detail.component').then((m) => m.DestinationsDetailComponent),
  },
];
