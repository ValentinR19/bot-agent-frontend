import { Routes } from '@angular/router';

export const FLOWS_DETAIL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./flows-detail.component').then((m) => m.FlowsDetailComponent),
  },
];
