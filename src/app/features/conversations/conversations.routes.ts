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
          import('./pages/conversations-list/conversations-list.page').then(
            (m) => m.ConversationsListPage
          )
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/conversations-list/conversations-list.page').then(
            (m) => m.ConversationsListPage
          )
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/conversations-list/conversations-list.page').then(
            (m) => m.ConversationsListPage
          )
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./pages/conversations-list/conversations-list.page').then(
            (m) => m.ConversationsListPage
          )
      }
    ]
  }
];
