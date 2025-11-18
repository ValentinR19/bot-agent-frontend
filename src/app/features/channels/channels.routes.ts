import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const CHANNELS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/channels-list.page').then((m) => m.ChannelsListPage),
      },
      {
        path: 'new',
        loadComponent: () => import('./pages/channels-form.page').then((m) => m.ChannelsFormPage),
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/channels-detail.page').then((m) => m.ChannelsDetailPage),
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./pages/channels-form.page').then((m) => m.ChannelsFormPage),
      },
    ],
  },
];
