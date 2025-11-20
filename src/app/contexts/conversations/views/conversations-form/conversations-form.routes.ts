import { Routes } from '@angular/router';

export const CONVERSATIONS_FORM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./conversations-form.component').then((m) => m.ConversationsFormComponent),
  },
];
