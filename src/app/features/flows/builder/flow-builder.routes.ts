/**
 * Rutas del Flow Builder
 */

import { Routes } from '@angular/router';
import { authGuard } from '../../../core/guards/auth.guard';

export const FLOW_BUILDER_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/flow-builder-page/flow-builder-page.component').then((m) => m.FlowBuilderPageComponent),
  },
];
