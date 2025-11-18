# BOT-AGENT FRONTEND – PROJECT RULES

Este documento define las reglas obligatorias que deben cumplirse durante el desarrollo del frontend.  
Claude Code debe basarse SIEMPRE en estas reglas antes de generar código.

---

# 1. Arquitectura General
- Angular 19/20.
- Standalone Components (NO NgModules).
- Feature-based architecture.
- Cada feature tiene su propio dominio funcional (Doman-Driven Frontend).
- Cada feature incluye su propio servicio, modelos, páginas y rutas lazy.
- Core contiene únicamente infraestructura transversal.
- Shared contiene componentes UI reutilizables.

---

# 2. Multi-Tenancy (CRÍTICO)
- Todas las requests HTTP deben agregar el header: `X-Tenant-Id`.
- El valor se obtiene desde `environment.tenantId`.
- Ningún servicio debe omitir el header.
- No implementar tenancy manual en cada request: usar TenantInterceptor.

---

# 3. Servicios HTTP
- Cada feature posee un service propio.
- NO colocar servicios en `core/services/`.
- Todos los servicios deben extender o utilizar `HttpService` de core.
- Los servicios se generan leyendo los endpoints del backend vía swagger-export.json.
- Respetar nomenclatura:  
  - tenants.service.ts  
  - tenants.model.ts  
  - tenants.routes.ts  
  - tenants-list.page.ts  

---

# 4. Rutas Lazy
Ejemplo correcto:

```ts
{
  path: 'tenants',
  loadChildren: () =>
    import('./features/tenants/tenants.routes')
      .then(m => m.TENANTS_ROUTES),
}
```

Rutas deben vivir SIEMPRE en `feature/xxx.routes.ts`.

---

# 5. Estado
- Usar RxJS (BehaviorSubject, Observable).
- NO usar Signals a menos que se solicite explícitamente.
- Cada service puede manejar un mini-store interno opcional.

---

# 6. UI y Estilos
- PrimeNG como biblioteca principal.
- SCSS como preprocesador.
- Ambos obligatorios.
- Crear Custom Components en `shared/components`.

---

# 7. Layout
- Layout principal con sidebar + topbar.
- Rutas internas usan el layout como wrapper.

---

# 8. Autenticación
- JWT almacenado en `localStorage`.
- AuthGuard vive en `/core/guards/auth.guard.ts`.
- Interceptor agrega `Authorization: Bearer xxx`.

---

# 9. Flujo de Desarrollo
1. Claude genera archivos dentro de la carpeta correspondiente.  
2. Claude respeta nombres, rutas y estructuras.  
3. Claude no mezcla dominios entre features.  
4. Claude usa swagger-export.json para generar modelos y servicios correctos.

---

# 10. Prohibiciones
❌ No usar NgModules  
❌ No colocar servicios en core  
❌ No duplicar lógica de tenancy  
❌ No usar Signals sin aprobación  
❌ No romper la estructura de carpetas

---

# 11. Objetivo del Proyecto
Crear un frontend completo para manejar:
- Multi-tenant SaaS de asistentes conversacionales.
- Flujos con Flow Engine.
- RAG + Knowledge Base.
- Conversaciones.
- Canales (Telegram, WhatsApp).
- Configuración del sistema.
- Gestión de usuarios, roles, permisos.
- LLM Usage / Cost Tracking.
