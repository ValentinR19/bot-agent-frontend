import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const CHANNELS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./views/channels-list/channels-list.component').then((m) => m.ChannelsListComponent),
      },
      {
        path: 'new',
        loadComponent: () => import('./views/channels-form/channels-form.component').then((m) => m.ChannelsFormComponent),
      },
      {
        path: ':id',
        loadComponent: () => import('./views/channels-detail/channels-detail.component').then((m) => m.ChannelsDetailComponent),
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./views/channels-form/channels-form.component').then((m) => m.ChannelsFormComponent),
      },
    ],
  },
];
