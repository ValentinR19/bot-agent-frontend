import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const KNOWLEDGE_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/knowledge-list/knowledge-list.page').then(
            (m) => m.KnowledgeListPage
          )
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/knowledge-list/knowledge-list.page').then(
            (m) => m.KnowledgeListPage
          )
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/knowledge-list/knowledge-list.page').then(
            (m) => m.KnowledgeListPage
          )
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./pages/knowledge-list/knowledge-list.page').then(
            (m) => m.KnowledgeListPage
          )
      }
    ]
  }
];
