import { Routes } from '@angular/router';

export const USERS_DETAIL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./users-detail.component').then((m) => m.UsersDetailComponent),
  },
];
