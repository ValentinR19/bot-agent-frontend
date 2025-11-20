import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const TEAMS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./views/teams-list/teams-list.component').then((m) => m.TeamsListComponent),
      },
      {
        path: 'new',
        loadComponent: () => import('./views/teams-form/teams-form.component').then((m) => m.TeamsFormComponent),
      },
      {
        path: ':id',
        loadComponent: () => import('./views/teams-detail/teams-detail.component').then((m) => m.TeamsDetailComponent),
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./views/teams-form/teams-form.component').then((m) => m.TeamsFormComponent),
      },
    ],
  },
];
