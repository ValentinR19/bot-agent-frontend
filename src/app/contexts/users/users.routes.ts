import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./views/users-list/users-list.routes').then((m) => m.USERS_LIST_ROUTES),
      },
      {
        path: 'new',
        loadChildren: () => import('./views/users-form/users-form.routes').then((m) => m.USERS_FORM_ROUTES),
      },
      {
        path: ':id',
        loadChildren: () => import('./views/users-detail/users-detail.routes').then((m) => m.USERS_DETAIL_ROUTES),
      },
      {
        path: ':id/edit',
        loadChildren: () => import('./views/users-form/users-form.routes').then((m) => m.USERS_FORM_ROUTES),
      },
    ],
  },
];
