import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { tenantRequiredGuard } from './core/guards/tenant-required.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { SelectTenantComponent } from './shared/views/select-tenant/select-tenant.component';

export const routes: Routes = [
  // Rutas públicas (sin layout)
  {
    path: 'auth',
    loadChildren: () => import('./contexts/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  // Ruta de selección de tenant (sin layout pero protegida)
  {
    path: 'select-tenant',
    component: SelectTenantComponent,
    canActivate: [authGuard],
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

      // Canales (TENANT-SCOPED)
      {
        path: 'channels',
        loadChildren: () => import('./contexts/channels/channels.routes').then((m) => m.CHANNELS_ROUTES),
        canActivate: [tenantRequiredGuard],
      },
      {
        path: 'conversations',
        loadChildren: () => import('./contexts/conversations/conversations.routes').then((m) => m.CONVERSATIONS_ROUTES),
        canActivate: [tenantRequiredGuard],
      },
      {
        path: 'destinations',
        loadChildren: () => import('./contexts/destinations/destinations.routes').then((m) => m.DESTINATIONS_ROUTES),
        canActivate: [tenantRequiredGuard],
      },

      // Flujos (TENANT-SCOPED)
      {
        path: 'flows',
        loadChildren: () => import('./contexts/flows/flows.routes').then((m) => m.FLOWS_ROUTES),
        canActivate: [tenantRequiredGuard],
      },

      // Conocimiento (TENANT-SCOPED)
      {
        path: 'knowledge',
        loadChildren: () => import('./contexts/knowledge/knowledge.routes').then((m) => m.KNOWLEDGE_ROUTES),
        canActivate: [tenantRequiredGuard],
      },
      {
        path: 'rag',
        loadChildren: () => import('./contexts/rag/rag.routes').then((m) => m.RAG_ROUTES),
        canActivate: [tenantRequiredGuard],
      },
      {
        path: 'catalog',
        loadChildren: () => import('./contexts/catalog/catalog.routes').then((m) => m.CATALOG_ROUTES),
        canActivate: [tenantRequiredGuard],
      },

      // Análisis (TENANT-SCOPED)
      {
        path: 'llm-usage',
        loadChildren: () => import('./contexts/llm-usage/llm-usage.routes').then((m) => m.LLM_USAGE_ROUTES),
        canActivate: [tenantRequiredGuard],
      },
    ],
  },

  // Ruta por defecto (404)
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
