/**
 * RAG Routes
 * Rutas del módulo de gestión RAG
 */

import { Routes } from '@angular/router';
import { RagListPageComponent } from './pages/rag-list-page/rag-list-page.component';
import { RagDetailPageComponent } from './pages/rag-detail-page/rag-detail-page.component';

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
