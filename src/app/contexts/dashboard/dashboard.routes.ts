import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadChildren: () => import('./views/dashboard/dashboard.routes').then((m) => m.DASHBOARD_VIEW_ROUTES),
  },
];
