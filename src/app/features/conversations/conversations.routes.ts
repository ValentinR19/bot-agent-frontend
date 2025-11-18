import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const CONVERSATIONS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/conversations-list.page').then((m) => m.ConversationsListPage),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/conversations-form.page').then((m) => m.ConversationsFormPage),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/conversations-detail.page').then((m) => m.ConversationsDetailPage),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./pages/conversations-form.page').then((m) => m.ConversationsFormPage),
      }
    ]
  }
];
