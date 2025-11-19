import { Routes } from '@angular/router';

export const USERS_FORM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./users-form.component').then((m) => m.UsersFormComponent),
  },
];
