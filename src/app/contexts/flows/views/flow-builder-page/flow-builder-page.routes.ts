import { Routes } from '@angular/router';

export const FLOW_BUILDER_PAGE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./flow-builder-page.component').then((m) => m.FlowBuilderPageComponent),
  },
];
