import { Routes } from '@angular/router';

export const CONVERSATIONS_LIST_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./conversations-list.component').then((m) => m.ConversationsListComponent),
  },
];
