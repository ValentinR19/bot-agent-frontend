import { Routes } from '@angular/router';

export const KNOWLEDGE_DETAIL_ROUTES: Routes = [
  {
    path: ':id',
    loadComponent: () => import('./knowledge-detail.component').then((m) => m.KnowledgeDetailComponent),
  },
];
