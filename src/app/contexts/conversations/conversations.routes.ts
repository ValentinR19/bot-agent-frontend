import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const CONVERSATIONS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./views/conversations-list/conversations-list.routes').then((m) => m.CONVERSATIONS_LIST_ROUTES),
      },
      {
        path: 'new',
        loadChildren: () => import('./views/conversations-form/conversations-form.routes').then((m) => m.CONVERSATIONS_FORM_ROUTES),
      },
      {
        path: ':id',
        loadChildren: () => import('./views/conversations-detail/conversations-detail.routes').then((m) => m.CONVERSATIONS_DETAIL_ROUTES),
      },
      {
        path: ':id/edit',
        loadChildren: () => import('./views/conversations-form/conversations-form.routes').then((m) => m.CONVERSATIONS_FORM_ROUTES),
      },
    ],
  },
];
