import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const FLOWS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./views/flows-list/flows-list.routes').then((m) => m.FLOWS_LIST_ROUTES),
      },
      {
        path: 'new',
        loadChildren: () => import('./views/flows-form/flows-form.routes').then((m) => m.FLOWS_FORM_ROUTES),
      },
      {
        path: ':id',
        loadChildren: () => import('./views/flows-detail/flows-detail.routes').then((m) => m.FLOWS_DETAIL_ROUTES),
      },
      {
        path: ':id/edit',
        loadChildren: () => import('./views/flows-form/flows-form.routes').then((m) => m.FLOWS_FORM_ROUTES),
      },
      {
        path: ':id/builder',
        loadChildren: () => import('./views/flow-builder-page/flow-builder-page.routes').then((m) => m.FLOW_BUILDER_PAGE_ROUTES),
      },
    ],
  },
];
