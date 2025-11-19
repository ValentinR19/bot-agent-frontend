import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  // Rutas públicas (sin layout)
  {
    path: 'auth',
    loadChildren: () => import('./contexts/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  // Rutas protegidas (con layout)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      // Dashboard (home)
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./contexts/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },

      // Configuración
      {
        path: 'tenants',
        loadChildren: () => import('./contexts/tenants/tenants.routes').then((m) => m.TENANTS_ROUTES),
      },
      {
        path: 'users',
        loadChildren: () => import('./contexts/users/users.routes').then((m) => m.USERS_ROUTES),
      },
      {
        path: 'teams',
        loadChildren: () => import('./contexts/teams/teams.routes').then((m) => m.TEAMS_ROUTES),
      },
      {
        path: 'roles',
        loadChildren: () => import('./contexts/roles/roles.routes').then((m) => m.ROLES_ROUTES),
      },
      {
        path: 'permissions',
        loadChildren: () => import('./contexts/permissions/permissions.routes').then((m) => m.PERMISSIONS_ROUTES),
      },

      // Canales
      {
        path: 'channels',
        loadChildren: () => import('./contexts/channels/channels.routes').then((m) => m.CHANNELS_ROUTES),
      },
      {
        path: 'conversations',
        loadChildren: () => import('./contexts/conversations/conversations.routes').then((m) => m.CONVERSATIONS_ROUTES),
      },
      {
        path: 'destinations',
        loadChildren: () => import('./contexts/destinations/destinations.routes').then((m) => m.DESTINATIONS_ROUTES),
      },

      // Flujos
      {
        path: 'flows',
        loadChildren: () => import('./contexts/flows/flows.routes').then((m) => m.FLOWS_ROUTES),
      },

      // Conocimiento
      {
        path: 'knowledge',
        loadChildren: () => import('./contexts/knowledge/knowledge.routes').then((m) => m.KNOWLEDGE_ROUTES),
      },
      {
        path: 'rag',
        loadChildren: () => import('./contexts/rag/rag.routes').then((m) => m.RAG_ROUTES),
      },
      {
        path: 'catalog',
        loadChildren: () => import('./contexts/catalog/catalog.routes').then((m) => m.CATALOG_ROUTES),
      },

      // Análisis
      {
        path: 'llm-usage',
        loadChildren: () => import('./contexts/llm-usage/llm-usage.routes').then((m) => m.LLM_USAGE_ROUTES),
      },
    ],
  },

  // Ruta por defecto (404)
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
