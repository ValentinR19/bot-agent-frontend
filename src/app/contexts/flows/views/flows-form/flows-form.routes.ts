import { Routes } from '@angular/router';

export const FLOWS_FORM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./flows-form.component').then((m) => m.FlowsFormComponent),
  },
];
