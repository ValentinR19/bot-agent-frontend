import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  // Rutas públicas (sin layout)
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES)
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
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.page').then(
            (m) => m.DashboardPage
          )
      },

      // Configuración
      {
        path: 'tenants',
        loadChildren: () =>
          import('./features/tenants/tenants.routes').then(
            (m) => m.TENANTS_ROUTES
          )
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./features/users/users.routes').then((m) => m.USERS_ROUTES)
      },
      {
        path: 'teams',
        loadChildren: () =>
          import('./features/teams/teams.routes').then((m) => m.TEAMS_ROUTES)
      },
      {
        path: 'roles',
        loadChildren: () =>
          import('./features/roles/roles.routes').then((m) => m.ROLES_ROUTES)
      },
      {
        path: 'permissions',
        loadChildren: () =>
          import('./features/permissions/permissions.routes').then(
            (m) => m.PERMISSIONS_ROUTES
          )
      },

      // Canales
      {
        path: 'channels',
        loadChildren: () =>
          import('./features/channels/channels.routes').then(
            (m) => m.CHANNELS_ROUTES
          )
      },
      {
        path: 'conversations',
        loadChildren: () =>
          import('./features/conversations/conversations.routes').then(
            (m) => m.CONVERSATIONS_ROUTES
          )
      },
      {
        path: 'destinations',
        loadChildren: () =>
          import('./features/destinations/destinations.routes').then(
            (m) => m.DESTINATIONS_ROUTES
          )
      },

      // Flujos
      {
        path: 'flows',
        loadChildren: () =>
          import('./features/flows/flows.routes').then((m) => m.FLOWS_ROUTES)
      },

      // Conocimiento
      {
        path: 'knowledge',
        loadChildren: () =>
          import('./features/knowledge/knowledge.routes').then(
            (m) => m.KNOWLEDGE_ROUTES
          )
      },
      {
        path: 'catalog',
        loadChildren: () =>
          import('./features/catalog/catalog.routes').then(
            (m) => m.CATALOG_ROUTES
          )
      },

      // Análisis
      {
        path: 'llm-usage',
        loadComponent: () =>
          import('./features/llm-usage/llm-usage.page').then(
            (m) => m.LlmUsagePage
          )
      }
    ]
  },

  // Ruta por defecto (404)
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
