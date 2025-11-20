import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

/**
 * Rutas principales del dominio Knowledge
 * Gestión de documentos RAG para la base de conocimiento
 */
export const KNOWLEDGE_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'documents',
        pathMatch: 'full',
      },
      {
        path: 'documents',
        loadChildren: () => import('./views/knowledge-list/knowledge-list.routes').then((m) => m.KNOWLEDGE_LIST_ROUTES),
      },
      {
        path: 'documents/new',
        loadChildren: () => import('./views/knowledge-form/knowledge-form.routes').then((m) => m.KNOWLEDGE_FORM_ROUTES),
      },
      {
        path: 'documents/:id',
        loadChildren: () => import('./views/knowledge-detail/knowledge-detail.routes').then((m) => m.KNOWLEDGE_DETAIL_ROUTES),
      },
      {
        path: 'documents/:id/edit',
        loadChildren: () => import('./views/knowledge-form/knowledge-form.routes').then((m) => m.KNOWLEDGE_FORM_ROUTES),
      },
      {
        path: 'playground',
        loadChildren: () => import('./views/rag-playground/rag-playground.routes').then((m) => m.RAG_PLAYGROUND_ROUTES),
      },
    ],
  },
];
