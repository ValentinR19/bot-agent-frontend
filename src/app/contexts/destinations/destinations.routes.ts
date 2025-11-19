import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const DESTINATIONS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./views/destinations-list/destinations-list.routes').then((m) => m.DESTINATIONS_LIST_ROUTES),
      },
      {
        path: 'new',
        loadChildren: () => import('./views/destinations-form/destinations-form.routes').then((m) => m.DESTINATIONS_FORM_ROUTES),
      },
      {
        path: ':id',
        loadChildren: () => import('./views/destinations-detail/destinations-detail.routes').then((m) => m.DESTINATIONS_DETAIL_ROUTES),
      },
      {
        path: ':id/edit',
        loadChildren: () => import('./views/destinations-form/destinations-form.routes').then((m) => m.DESTINATIONS_FORM_ROUTES),
      },
    ],
  },
];
