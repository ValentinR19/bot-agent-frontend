import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const ROLES_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./views/roles-list/roles-list.component').then((m) => m.RolesListComponent),
      },
      {
        path: 'new',
        loadComponent: () => import('./views/roles-form/roles-form.component').then((m) => m.RolesFormComponent),
      },
      {
        path: ':id',
        loadComponent: () => import('./views/roles-detail/roles-detail.component').then((m) => m.RolesDetailComponent),
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./views/roles-form/roles-form.component').then((m) => m.RolesFormComponent),
      },
    ],
  },
];
