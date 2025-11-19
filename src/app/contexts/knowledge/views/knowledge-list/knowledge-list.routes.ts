import { Routes } from '@angular/router';

export const KNOWLEDGE_LIST_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./knowledge-list.component').then((m) => m.KnowledgeListComponent),
  },
];
