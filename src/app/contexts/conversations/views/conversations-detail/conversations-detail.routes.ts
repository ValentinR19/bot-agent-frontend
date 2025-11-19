import { Routes } from '@angular/router';

export const CONVERSATIONS_DETAIL_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./conversations-detail.component').then((m) => m.ConversationsDetailComponent),
  },
];
