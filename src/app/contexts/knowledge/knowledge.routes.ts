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
        loadChildren: () => import('./views/knowledge-list/knowledge-list.routes').then((m) => m.KNOWLEDGE_LIST_ROUTES),
      },
      {
        path: '',
        loadChildren: () => import('./views/knowledge-form/knowledge-form.routes').then((m) => m.KNOWLEDGE_FORM_ROUTES),
      },
      {
        path: '',
        loadChildren: () => import('./views/knowledge-detail/knowledge-detail.routes').then((m) => m.KNOWLEDGE_DETAIL_ROUTES),
      },
    ],
  },
];
