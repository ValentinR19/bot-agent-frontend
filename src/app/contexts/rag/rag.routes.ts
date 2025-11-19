/**
 * RAG Routes
 * Rutas del módulo de gestión RAG
 */

import { Routes } from '@angular/router';
import { RagListPageComponent } from './views/rag-list-page/rag-list-page.component';
import { RagDetailPageComponent } from './views/rag-detail-page/rag-detail-page.component';

export const RAG_ROUTES: Routes = [
  {
    path: '',
    component: RagListPageComponent,
  },
  {
    path: ':id',
    component: RagDetailPageComponent,
  },
];
