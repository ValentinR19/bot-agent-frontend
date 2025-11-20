import { Routes } from '@angular/router';

export const USERS_LIST_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./users-list.component').then((m) => m.UsersListComponent),
  },
];
