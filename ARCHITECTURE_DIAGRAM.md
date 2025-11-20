# Diagrama de Arquitectura - Bot Agent Frontend

## 1. ESTRUCTURA DE CARPETAS

```
bot-agent-frontend/
├── src/
│   ├── app/
│   │   ├── app.routes.ts                 # Enrutamiento principal
│   │   ├── app.config.ts                 # Configuración de app (PrimeNG, Interceptores)
│   │   │
│   │   ├── core/                         # SERVICIOS GLOBALES
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── tenant-required.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   ├── tenant.interceptor.ts
│   │   │   │   └── http-error.interceptor.ts
│   │   │   ├── http/
│   │   │   │   ├── http.service.ts       # Wrapper centralizado
│   │   │   │   └── http-error-handler.ts
│   │   │   ├── services/
│   │   │   │   └── tenant.service.ts     # Contexto multi-tenant
│   │   │   ├── models/
│   │   │   │   └── api-response.model.ts
│   │   │   └── utils/
│   │   │       └── jwt.util.ts
│   │   │
│   │   ├── layout/                       # LAYOUT PRINCIPAL
│   │   │   ├── main-layout/
│   │   │   ├── sidebar/
│   │   │   └── topbar/
│   │   │
│   │   ├── shared/                       # COMPONENTES REUTILIZABLES
│   │   │   ├── components/
│   │   │   │   ├── custom-table/
│   │   │   │   ├── custom-form/
│   │   │   │   ├── custom-modal/
│   │   │   │   ├── filter-panel/
│   │   │   │   └── page-header/
│   │   │   ├── models/
│   │   │   │   └── pagination.model.ts
│   │   │   └── views/
│   │   │       └── select-tenant/
│   │   │
│   │   ├── contexts/                     # FEATURES (DOMINIOS)
│   │   │   ├── auth/
│   │   │   │   ├── models/
│   │   │   │   ├── services/
│   │   │   │   └── views/
│   │   │   │       ├── login/
│   │   │   │       └── register/
│   │   │   │
│   │   │   ├── flows/                    # FEATURE: FLUJOS
│   │   │   │   ├── models/
│   │   │   │   │   ├── flow.model.ts
│   │   │   │   │   └── builder/
│   │   │   │   ├── services/
│   │   │   │   │   ├── flows.service.ts
│   │   │   │   │   └── builder/
│   │   │   │   ├── views/
│   │   │   │   │   ├── flows-list/
│   │   │   │   │   ├── flows-form/
│   │   │   │   │   ├── flows-detail/
│   │   │   │   │   └── flow-builder-page/
│   │   │   │   │       └── components/
│   │   │   │   │           ├── builder-canvas/
│   │   │   │   │           ├── toolbox/
│   │   │   │   │           ├── node-item/
│   │   │   │   │           ├── node-properties/
│   │   │   │   │           ├── flow-preview/
│   │   │   │   │           └── transition-editor/
│   │   │   │   └── flows.routes.ts
│   │   │   │
│   │   │   ├── channels/                 # FEATURE: CANALES
│   │   │   │   ├── models/
│   │   │   │   │   ├── channel.model.ts
│   │   │   │   │   └── dtos/
│   │   │   │   │       └── telegram-setup.dto.ts
│   │   │   │   ├── services/
│   │   │   │   │   └── channels.service.ts
│   │   │   │   ├── views/
│   │   │   │   │   ├── channels-list/
│   │   │   │   │   ├── channels-form/
│   │   │   │   │   └── channels-detail/
│   │   │   │   └── channels.routes.ts
│   │   │   │
│   │   │   ├── destinations/
│   │   │   ├── conversations/
│   │   │   ├── catalog/
│   │   │   ├── knowledge/
│   │   │   ├── rag/
│   │   │   ├── llm-usage/
│   │   │   ├── teams/
│   │   │   ├── users/
│   │   │   ├── roles/
│   │   │   ├── permissions/
│   │   │   ├── tenants/
│   │   │   └── dashboard/
│   │   │
│   │   └── environments/
│   │       ├── environment.ts
│   │       └── environment.prod.ts
│   │
│   ├── index.html
│   └── main.ts
│
├── angular.json
├── tsconfig.json
├── package.json
└── PROJECT_PATTERNS.md
```

## 2. FLUJO DE DATOS (Data Flow)

```
                            ┌─────────────────────────────┐
                            │      User Browser          │
                            └────────────┬────────────────┘
                                        │
                                        ▼
                        ┌────────────────────────────────┐
                        │     Angular Application        │
                        │  (Standalone Components)       │
                        └────────────┬───────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
          ▼                         ▼                         ▼
    ┌──────────────┐         ┌──────────────┐        ┌──────────────┐
    │ Components   │         │  Services    │        │  Guards &    │
    │ (Standalone) │         │  (Injectable)│        │ Interceptors │
    ├──────────────┤         ├──────────────┤        ├──────────────┤
    │ FlowsList    │◄────────│ FlowService  │────────│ authGuard    │
    │ FlowsForm    │         │ ChannelsSvc  │        │ tenantIcptr  │
    │ FlowsDetail  │         │ HttpService  │        │ authIcptr    │
    │ CustomTable  │         │ TenantSvc    │        │ errorIcptr   │
    └──────────────┘         └──────┬───────┘        └──────────────┘
          │                         │
          └─────────────────────────┼─────────────────────────┘
                                    │
                        ┌──────────────▼──────────────┐
                        │   HttpClient (Angular)     │
                        │  + Interceptores Aplicados │
                        └──────────────┬──────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
         Headers   │                 │                 │
         Added:    │                 │                 │
    - Authorization: Bearer {token}  │                 │
    - X-Tenant-Id: {tenantId}        │                 │
                    │                 │                 │
                    └─────────────────┼─────────────────┘
                                      │
                        ┌─────────────▼──────────────┐
                        │  Backend API (REST)        │
                        │  - /api/v1/flows           │
                        │  - /api/v1/channels        │
                        │  - /api/v1/{resource}      │
                        └─────────────┬──────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
            ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
            │  Flows DB    │  │ Channels DB  │  │ Other DB     │
            └──────────────┘  └──────────────┘  └──────────────┘
```

## 3. FLUJO DE AUTENTICACIÓN Y MULTI-TENANT

```
                    ┌──────────────────────────┐
                    │   Login Page (Public)    │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │  AuthService.login()     │
                    │ Envía: username, pwd     │
                    └────────────┬─────────────┘
                                 │
                    No header X-Tenant-Id
                    (endpoint global)
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │   Backend Authentication │
                    │   Retorna: JWT + Tenants │
                    └────────────┬─────────────┘
                                 │
                    Token: eyJhbGc...
                    Tenants: [{id, name, role}]
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │  TenantService.init()    │
                    │ - Guarda token           │
                    │ - Selecciona tenant      │
                    │ - Inicializa contexto    │
                    └────────────┬─────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
    ┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
    │ localStorage:    │ │ localStorage:│ │  Service     │
    │ access_token     │ │ active_tenant│ │  Observables │
    │ = eyJhbGc...     │ │ = {tenantId} │ │  Emitidos    │
    └──────────────────┘ └──────────────┘ └──────────────┘
                │                │
                └────────────────┼────────────────┐
                                 │                │
                                 ▼                ▼
                    ┌──────────────────────────────────┐
                    │  authInterceptor + tenantIcptr   │
                    │ ┌─────────────────────────────┐  │
                    │ │ Request Headers:            │  │
                    │ │ Authorization: Bearer token │  │
                    │ │ X-Tenant-Id: tenantId       │  │
                    │ └─────────────────────────────┘  │
                    └────────────┬─────────────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │ Navigate to Dashboard    │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │ MainLayout + Routes      │
                    │ (todos los requests      │
                    │  incluyen headers)       │
                    └──────────────────────────┘
```

## 4. CICLO DE VIDA DE UN COMPONENTE CRUD

```
┌─────────────────────────────────────────────────────────────┐
│                        USER ACTION                           │
│                  (Navigate to /flows/new)                    │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
                 ┌───────────────────────┐
                 │  Router LoadComponent │
                 │  FlowsFormComponent   │
                 └───────────┬───────────┘
                             │
                             ▼
                 ┌───────────────────────────────┐
                 │  ngOnInit()                   │
                 │  - Detectar modo (NEW/EDIT)   │
                 │  - Inicializar formulario     │
                 │  - Cargar datos si EDIT       │
                 └───────────┬───────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼ (CREATE)          ▼ (EDIT)            │
    Formulario          Cargar Flow          (Display)
    en blanco           del servicio
                             │
                             ▼
                   ┌──────────────────┐
                   │  flowsService    │
                   │  .findOne(id)    │
                   └────────┬─────────┘
                            │
                 (HttpClient + Interceptores)
                            │
                            ▼
                   ┌──────────────────┐
                   │   Backend API    │
                   │  GET /flows/{id} │
                   │  Header:         │
                   │  - Auth: Bearer  │
                   │  - X-Tenant-Id   │
                   └────────┬─────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │  Respuesta JSON  │
                   │  { ...flow }     │
                   └────────┬─────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │  tap() en servicio│
                   │  Actualiza BSubj │
                   └────────┬─────────┘
                            │
                            ▼
                   ┌──────────────────────────┐
                   │  Componente recibe datos │
                   │  .patchValue(flow)       │
                   │  Formulario se rellena   │
                   └────────┬─────────────────┘
                            │
                            ▼
                   ┌──────────────────────────┐
                   │   Usuario modifica form  │
                   │   y hace click "Guardar" │
                   └────────┬─────────────────┘
                            │
                            ▼
                   ┌──────────────────────────┐
                   │  onSubmit()              │
                   │  - Valida formulario     │
                   │  - Construye DTO         │
                   │  - Llama servicio        │
                   └────────┬─────────────────┘
                            │
         ┌──────────────────┴──────────────────┐
         │                                     │
         ▼ (CREATE)                            ▼ (UPDATE)
    flowsService.create(dto)          flowsService.update(id, dto)
         │                                     │
         └──────────────────┬──────────────────┘
                            │
                   (HttpClient POST/PUT)
                            │
                            ▼
                   ┌──────────────────┐
                   │  Backend Save    │
                   │  Retorna Flow    │
                   └────────┬─────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │  tap() actualiza estado │
              │  BehaviorSubject        │
              └────────┬────────────────┘
                       │
                       ▼
            ┌──────────────────────────┐
            │  messageService.add()    │
            │  Toast "Éxito"           │
            │  (PrimeNG)               │
            └────────┬─────────────────┘
                     │
                     ▼
            ┌──────────────────────────┐
            │  router.navigate()       │
            │  Ir a /flows             │
            │  o /flows/{id}           │
            └────────┬─────────────────┘
                     │
                     ▼
            ┌──────────────────────────┐
            │  ngOnDestroy()           │
            │  destroy$.next()         │
            │  cleanup suscripciones   │
            └──────────────────────────┘
```

## 5. TREE DE DEPENDENCIAS (Inyección)

```
HttpService (core)
    │
    ├─ HttpClient (Angular)
    └─ environment.apiUrl

FlowsService (context)
    │
    ├─ HttpService
    ├─ BehaviorSubject (flows$, loading$)
    └─ Operadores RxJS (tap, takeUntil)

FlowsListComponent
    │
    ├─ FlowsService
    ├─ Router
    ├─ MessageService (PrimeNG)
    ├─ ConfirmationService (PrimeNG)
    ├─ CustomTableComponent (shared)
    ├─ FilterPanelComponent (shared)
    ├─ PageHeaderComponent (shared)
    └─ Subject (destroy$)

Guards
    │
    ├─ Router (inyectado)
    ├─ TenantService (inyectado)
    └─ localStorage

Interceptores
    │
    ├─ TenantService
    ├─ HttpRequest
    └─ Observable<HttpEvent<any>>
```

## 6. COMPONENTES COMPARTIDOS

```
Shared Components
│
├─ CustomTableComponent
│  ├─ Input: data[], columns[], actions[], loading
│  ├─ Output: pageChange, sortChange, selectionChange
│  ├─ Usa: PrimeNG TableModule, ButtonModule
│  └─ Reutilizado por: Flows, Channels, Destinations, etc.
│
├─ CustomFormComponent
│  ├─ Input: fields[], formGroup, submitLabel, cancelLabel
│  ├─ Output: submit, cancel
│  ├─ Usa: Validadores, FormGroup reactivo
│  └─ Reutilizado por: Formularios genéricos
│
├─ CustomModalComponent
│  ├─ Input: visible, title, content
│  ├─ Output: close, confirm
│  ├─ Usa: PrimeNG DialogModule
│  └─ Reutilizado por: Confirmaciones, ediciones
│
├─ FilterPanelComponent
│  ├─ Input: filters, data
│  ├─ Output: filtro
│  └─ Reutilizado por: Listas
│
├─ PageHeaderComponent
│  ├─ Input: title, description, actions
│  └─ Reutilizado por: Todas las vistas
│
└─ SelectTenantComponent
   ├─ Input: tenants[]
   ├─ Output: tenantSelected
   └─ Usado en: /select-tenant (post-login)
```

## 7. PATRÓN DE FEATURE (Context)

Cada feature sigue este patrón:

```
contexts/[feature]/
│
├─ [feature].routes.ts
│  └─ Define: '' -> loadChildren -> list
│                  'new' -> loadChildren -> form
│                  ':id' -> loadChildren -> detail
│                  ':id/edit' -> loadChildren -> form
│
├─ models/
│  ├─ [entity].model.ts (interfaces, enums)
│  └─ dtos/
│      └─ [dto-name].ts
│
├─ services/
│  ├─ [feature].service.ts (principal)
│  └─ builder/ (si es complejo)
│      └─ state-service.ts
│
└─ views/
   ├─ [feature]-list/
   │  ├─ [feature]-list.component.ts
   │  ├─ [feature]-list.component.html
   │  ├─ [feature]-list.component.scss
   │  └─ [feature]-list.routes.ts
   │
   ├─ [feature]-form/
   │  └─ (mismo patrón)
   │
   ├─ [feature]-detail/
   │  └─ (mismo patrón)
   │
   └─ [custom-view]/ (opcional)
      └─ components/ (sub-componentes)
         ├─ component1/
         ├─ component2/
         └─ component3/
```

## 8. ESTADO DE LA APLICACIÓN

```
LocalStorage
├─ access_token = "eyJhbGc..."
├─ active_tenant_id = "tenant-123"
└─ (otros datos persistentes)

RxJS BehaviorSubjects (en Servicios)
├─ FlowsService
│  ├─ flows$ = BehaviorSubject<Flow[]>([])
│  └─ loading$ = BehaviorSubject<boolean>(false)
├─ ChannelsService
│  ├─ channels$ = BehaviorSubject<Channel[]>([])
│  └─ loading$ = BehaviorSubject<boolean>(false)
├─ TenantService
│  ├─ currentTenantId$ = BehaviorSubject<string|null>()
│  └─ userTenants$ = BehaviorSubject<AuthUserTenant[]>([])
└─ AuthService
   ├─ currentUser$ = BehaviorSubject<User|null>()
   └─ isAuthenticated$ = BehaviorSubject<boolean>(false)

Componentes (Estados Locales)
├─ Formularios (FormGroup)
├─ Datos cargados (variables)
├─ Estados UI (loading, errors)
└─ Selecciones (usuario, filtros)
```

## 9. CICLO DE VIDA DE UNA PETICIÓN HTTP

```
┌─────────────────────────────────────────────────────┐
│          Componente llama: service.getData()        │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
        ┌──────────────────────────────┐
        │   Service llama             │
        │   httpService.get<T>(url)   │
        └────────────┬────────────────┘
                     │
                     ▼
    ┌────────────────────────────────────┐
    │  tenantInterceptor                │
    │  - Detecta endpoint global/tenant? │
    │  - Agrega X-Tenant-Id header      │
    └────────────┬───────────────────────┘
                 │
                 ▼
    ┌────────────────────────────────────┐
    │  authInterceptor                  │
    │  - Agrega Authorization header    │
    │  - Bearer {token}                 │
    └────────────┬───────────────────────┘
                 │
                 ▼
    ┌────────────────────────────────────┐
    │  httpErrorInterceptor             │
    │  - Prepara manejo de errores      │
    └────────────┬───────────────────────┘
                 │
                 ▼
        ┌──────────────────────────┐
        │   HTTP Request enviado   │
        │                          │
        │ GET /api/v1/flows HTTP/1.1
        │ Host: backend.example.com
        │ Authorization: Bearer eyJ...
        │ X-Tenant-Id: tenant-123
        │                          │
        └────────────┬─────────────┘
                     │
                     ▼
        ┌──────────────────────────┐
        │   Backend API            │
        │   Procesa request        │
        │   Valida tenant          │
        │   Retorna datos          │
        └────────────┬─────────────┘
                     │
                     ▼
        ┌──────────────────────────┐
        │  HTTP Response 200 OK    │
        │  Content-Type: JSON      │
        │                          │
        │  {                       │
        │    data: [...],          │
        │    meta: { ... }         │
        │  }                       │
        │                          │
        └────────────┬─────────────┘
                     │
                     ▼
    ┌────────────────────────────────────┐
    │  httpErrorInterceptor             │
    │  - Si es error: dispara acciones   │
    │  - Si es 401: redirige a login     │
    │  - Si es 403: muestra forbidden    │
    └────────────┬───────────────────────┘
                 │
                 ▼
      ┌──────────────────────────────┐
      │  Service recibe respuesta    │
      │  Operador: tap()             │
      │  - Extrae response.data      │
      │  - Actualiza BehaviorSubject │
      │  - Emite al componente       │
      └────────────┬────────────────┘
                   │
                   ▼
      ┌──────────────────────────────┐
      │  Componente recibe datos     │
      │  subscription.next()         │
      │  - Asigna a propiedad        │
      │  - Change Detection          │
      │  - Re-renderiza template     │
      └──────────────────────────────┘
```

---

## Resumen de Dependencias Externas

- **Angular 19**: Framework
- **PrimeNG 19**: UI Components
- **RxJS 7.8**: Manejo reactivo
- **TypeScript 5.6**: Tipado
- **Angular Forms**: Formularios reactivos

