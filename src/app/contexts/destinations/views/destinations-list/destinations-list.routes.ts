import { Routes } from '@angular/router';

export const DESTINATIONS_LIST_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./destinations-list.component').then((m) => m.DestinationsListComponent),
  },
];
