import { Routes } from '@angular/router';

export const KNOWLEDGE_FORM_ROUTES: Routes = [
  {
    path: 'new',
    loadComponent: () => import('./knowledge-form.component').then((m) => m.KnowledgeFormComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./knowledge-form.component').then((m) => m.KnowledgeFormComponent),
  },
];
