import { Routes } from '@angular/router';

export const FLOWS_LIST_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./flows-list.component').then((m) => m.FlowsListComponent),
  },
];
