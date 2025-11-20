# Análisis de Estructura y Patrones - Bot Agent Frontend

## 1. ORGANIZACIÓN DE FEATURES (Flows, Channels)

### Estructura de Carpetas por Feature

```
src/app/contexts/[feature-name]/
├── models/
│   ├── [entity].model.ts          # Interfaces principales
│   └── dtos/                      # DTOs adicionales si es necesario
├── services/
│   ├── [feature].service.ts       # Servicio principal
│   └── builder/                   # Servicios especializados (si aplica)
├── views/
│   ├── [feature]-list/
│   │   ├── [feature]-list.component.ts
│   │   ├── [feature]-list.component.html
│   │   ├── [feature]-list.component.scss
│   │   └── [feature]-list.routes.ts
│   ├── [feature]-form/
│   ├── [feature]-detail/
│   └── [custom-views]/            # Vistas especializadas (builder, etc)
├── [feature].routes.ts            # Enrutamiento del feature
└── shared/components/             # Componentes globales reutilizables
```

### Patrones de Enrutamiento

**Nivel 1: Main Routes (app.routes.ts)**
```typescript
// Lazy loading por feature completo
{
  path: 'flows',
  loadChildren: () => import('./contexts/flows/flows.routes')
    .then((m) => m.FLOWS_ROUTES),
  canActivate: [tenantRequiredGuard]
}
```

**Nivel 2: Feature Routes ([feature].routes.ts)**
```typescript
// Enrutamiento completo del feature
export const FLOWS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', loadChildren: () => ... },
      { path: 'new', loadChildren: () => ... },
      { path: ':id', loadChildren: () => ... },
      { path: ':id/edit', loadChildren: () => ... }
    ]
  }
];
```

**Nivel 3: View Routes ([view].routes.ts)**
```typescript
// Cada vista puede tener subrutas
export const FLOWS_LIST_ROUTES: Routes = [
  {
    path: '',
    component: FlowsListComponent
  }
];
```

### Diferencia: Flows vs Channels

**Flows (Lazy componentes por ruta)**
```typescript
path: ':id',
loadChildren: () => import('./flows-detail/flows-detail.routes')
  .then((m) => m.FLOWS_DETAIL_ROUTES)
```

**Channels (Lazy componentes directos)**
```typescript
path: ':id',
loadComponent: () => import('./channels-detail.component')
  .then((m) => m.ChannelsDetailComponent)
```

> Ambos enfoques son válidos. Channels es más directo para componentes simples.

---

## 2. ESTRUCTURA DE SERVICIOS EN CORE/

### Organización del Core

```
src/app/core/
├── guards/
│   ├── auth.guard.ts              # Protege rutas autenticadas
│   └── tenant-required.guard.ts   # Protege rutas tenant-scoped
├── interceptors/
│   ├── auth.interceptor.ts        # Agrega JWT al header
│   ├── tenant.interceptor.ts      # Agrega X-Tenant-Id (multi-tenant)
│   └── http-error.interceptor.ts  # Manejo centralizado de errores
├── http/
│   ├── http.service.ts            # Wrapper sobre HttpClient
│   └── http-error-handler.ts      # Lógica de errores HTTP
├── services/
│   └── tenant.service.ts          # Gestión del contexto multi-tenant
├── models/
│   └── api-response.model.ts      # Interfaces globales de API
└── utils/
    └── jwt.util.ts                # Utilidades JWT
```

### Patrón de Servicio Funcionales (Guards & Interceptors)

**Auth Guard (Funcional)**
```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  return true;
};
```

**Tenant Interceptor (Funcional)**
```typescript
export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const tenantService = inject(TenantService);
  
  // Exluir endpoints globales
  const isGlobalEndpoint = globalEndpoints.some(ep => req.url.includes(ep));
  if (isGlobalEndpoint) return next(req);
  
  // Agregar X-Tenant-Id para endpoints tenant-scoped
  const tenantId = tenantService.getCurrentTenantId();
  if (!tenantId) return next(req);
  
  return next(req.clone({
    setHeaders: { 'X-Tenant-Id': tenantId }
  }));
};
```

### Patrón de Servicios (Injectable)

```typescript
@Injectable({ providedIn: 'root' })
export class FlowsService {
  private readonly http = inject(HttpService);
  private readonly baseUrl = '/flows';
  
  // Mini-store con BehaviorSubject
  private flowsSubject = new BehaviorSubject<Flow[]>([]);
  public flows$ = this.flowsSubject.asObservable();
  
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  
  // Métodos CRUD
  findAll(): Observable<PaginatedResponse<Flow>> {
    this.loadingSubject.next(true);
    return this.http.get<PaginatedResponse<Flow>>(this.baseUrl).pipe(
      tap({
        next: (response) => {
          this.flowsSubject.next(response.data);
          this.loadingSubject.next(false);
        }
      })
    );
  }
  
  // Más métodos CRUD...
}
```

### HttpService (Wrapper centralizado)

```typescript
@Injectable({ providedIn: 'root' })
export class HttpService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;
  
  // Métodos genéricos con tipado
  get<T>(endpoint: string, options?: HttpOptions): Observable<T>
  post<T>(endpoint: string, body: any, options?: HttpOptions): Observable<T>
  put<T>(endpoint: string, body: any, options?: HttpOptions): Observable<T>
  delete<T>(endpoint: string, options?: HttpOptions): Observable<T>
  
  // Tipos especiales
  getBlob(endpoint: string): Observable<Blob>
  getBuffer(endpoint: string): Observable<ArrayBuffer>
}
```

---

## 3. PATRONES DE COMPONENTES STANDALONE

### Componente Lista (Patrón CRUD List)

```typescript
@Component({
  selector: 'app-flows-list',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    CustomTableComponent,
    FilterPanelComponent,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './flows-list.component.html',
  styleUrl: './flows-list.component.scss',
})
export class FlowsListComponent implements OnInit, OnDestroy {
  // Inyecciones
  private readonly flowsService = inject(FlowsService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly destroy$ = new Subject<void>();
  
  // Estados
  flows: Flow[] = [];
  loading = false;
  searchText = '';
  
  // Configuración de tabla
  columns: TableColumn[] = [
    { field: 'name', header: 'Nombre', sortable: true, filterable: true },
    // ...
  ];
  
  actions: TableAction[] = [
    { label: 'Ver', icon: 'pi pi-eye', command: (f) => this.viewFlow(f) },
    // ...
  ];
  
  // Ciclo de vida
  ngOnInit(): void {
    this.loadFlows();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  // Métodos
  loadFlows(): void {
    this.loading = true;
    this.flowsService
      .findAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.flows = response.data;
          this.loading = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar'
          });
          this.loading = false;
        }
      });
  }
  
  deleteFlow(flow: Flow): void {
    this.confirmationService.confirm({
      message: `¿Está seguro?`,
      accept: () => {
        this.flowsService
          .delete(flow.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                detail: 'Flujo eliminado'
              });
              this.loadFlows();
            }
          });
      }
    });
  }
}
```

### Componente Formulario (Patrón CRUD Form)

```typescript
@Component({
  selector: 'app-flows-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    ToggleSwitchModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './flows-form.component.html',
  styleUrl: './flows-form.component.scss',
})
export class FlowsFormComponent implements OnInit, OnDestroy {
  private readonly flowsService = inject(FlowsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly destroy$ = new Subject<void>();
  
  flowForm!: FormGroup;
  isEditMode = false;
  flowId: string | null = null;
  saving = false;
  
  ngOnInit(): void {
    this.initForm();
    this.flowId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.flowId;
    
    if (this.isEditMode && this.flowId) {
      this.loadFlow(this.flowId);
    }
  }
  
  initForm(): void {
    this.flowForm = new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(3)
      ]),
      // ...
    });
  }
  
  onSubmit(): void {
    if (this.flowForm.valid) {
      this.saving = true;
      const dto = this.flowForm.value;
      
      const request = this.isEditMode
        ? this.flowsService.update(this.flowId!, dto)
        : this.flowsService.create(dto);
      
      request.pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success' });
          this.goBack();
        },
        error: () => {
          this.messageService.add({ severity: 'error' });
          this.saving = false;
        }
      });
    }
  }
}
```

### Componente Detalle (Patrón Read-Only)

```typescript
@Component({
  selector: 'app-flows-detail',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    DividerModule,
    SkeletonModule,
    ToastModule,
    TagModule
  ],
  providers: [MessageService],
  templateUrl: './flows-detail.component.html',
  styleUrl: './flows-detail.component.scss',
})
export class FlowsDetailComponent implements OnInit, OnDestroy {
  // Mismos patrones que List y Form
  flow: Flow | null = null;
  nodes: FlowNode[] = [];
  loading = false;
  
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadFlow(id);
      this.loadNodes(id);
    }
  }
}
```

### Componente Compartido (CustomTable)

```typescript
@Component({
  selector: 'app-custom-table',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, InputTextModule],
  templateUrl: './custom-table.component.html',
  styleUrl: './custom-table.component.scss',
})
export class CustomTableComponent {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction[] = [];
  @Input() loading = false;
  @Input() paginator = true;
  @Input() rows = 10;
  
  @Output() pageChange = new EventEmitter<any>();
  @Output() sortChange = new EventEmitter<any>();
  @Output() selectionChange = new EventEmitter<any>();
  
  selectedItems: any[] = [];
}
```

---

## 4. CONFIGURACIÓN DE ROUTING

### Estrategia Multi-Nivel

1. **Root Routes** (`app.routes.ts`)
   - Separación: Público vs Protegido
   - Lazy loading de features completos
   - Guards a nivel de feature

2. **Feature Routes** (`[feature].routes.ts`)
   - Contenedor con canActivate
   - Children con lazy loading de vistas
   - Patrones CRUD (List, Form, Detail)

3. **View Routes** (`[view].routes.ts`)
   - Path vacío que carga el componente
   - Sub-rutas si es necesario

### Ejemplo Completo

```
Root Routes (app.routes.ts)
├── /auth → loadChildren → auth.routes
├── /select-tenant → SelectTenantComponent
└── '' (MainLayout)
    ├── /dashboard → loadChildren → dashboard.routes
    ├── /flows → loadChildren → flows.routes
    │   ├── '' → loadChildren → flows-list.routes
    │   │   └── FlowsListComponent
    │   ├── /new → loadChildren → flows-form.routes
    │   │   └── FlowsFormComponent
    │   ├── /:id → loadChildren → flows-detail.routes
    │   │   └── FlowsDetailComponent
    │   ├── /:id/edit → loadChildren → flows-form.routes
    │   │   └── FlowsFormComponent
    │   └── /:id/builder → loadChildren → flow-builder-page.routes
    │       └── FlowBuilderPageComponent
    └── /channels → loadChildren → channels.routes
        ├── '' → loadComponent → ChannelsListComponent
        ├── /new → loadComponent → ChannelsFormComponent
        └── /:id → loadComponent → ChannelsDetailComponent
```

### Guards Utilizados

- **authGuard**: Protege rutas con JWT
- **tenantRequiredGuard**: Verifica que hay tenant seleccionado
- **Ambos funcionales** usando `CanActivateFn`

---

## 5. USO DE PRIMENG

### Configuración Global (app.config.ts)

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([
      tenantInterceptor,
      authInterceptor,
      httpErrorInterceptor
    ])),
    provideAnimations(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          prefix: 'p',
          darkModeSelector: 'system',
          cssLayer: false,
        },
      },
    }),
  ],
};
```

### Módulos PrimeNG Utilizados

```typescript
// Layouts & Structure
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { MenuModule } from 'primeng/menu';

// Forms
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormModule } from 'primeng/form';

// Data
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';

// Overlays & Modals
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

// Utilities
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
```

### Servicios PrimeNG

```typescript
import { MessageService, ConfirmationService } from 'primeng/api';

// En el componente
providers: [MessageService, ConfirmationService]

// Uso
this.messageService.add({
  severity: 'success',
  summary: 'Éxito',
  detail: 'Operación completada'
});

this.confirmationService.confirm({
  message: '¿Está seguro?',
  accept: () => { /* ... */ }
});
```

### Estilos Base

- **Tema**: Aura con soporte para dark mode
- **Iconos**: PrimeIcons (pi pi-*)
- **Grid**: PrimeFlex (clases CSS)
- **Variables CSS**: Disponibles desde @primeng/themes

---

## 6. PATRONES DE RESPUESTA API

### Modelos Globales

```typescript
// Respuesta paginada (más común)
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Respuesta simple
export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode?: number;
}

// Errores
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
```

### Extracción en Componentes

```typescript
// En servicios
findAll(): Observable<PaginatedResponse<Flow>> {
  return this.http.get<PaginatedResponse<Flow>>(this.baseUrl);
}

// En componentes
loadFlows(): void {
  this.flowsService.findAll()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response: any) => {
        this.flows = response.data;  // Acceder a .data
      }
    });
}
```

---

## 7. PATRONES DE CICLO DE VIDA

### OnInit & OnDestroy

```typescript
export class MyComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  
  ngOnInit(): void {
    // Cargar datos
    this.service
      .getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### ChangeDetectionStrategy

```typescript
@Component({
  // ...
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomFormComponent {
  // Solo se detectan cambios en Input/Output
}
```

---

## 8. PATRONES DE FORMULARIOS REACTIVOS

### FormGroup Tipado

```typescript
interface MyFormControls {
  name: FormControl<string>;
  email: FormControl<string>;
  age: FormControl<number>;
}

this.form = new FormGroup<MyFormControls>({
  name: new FormControl('', { nonNullable: true, validators: [...] }),
  email: new FormControl('', { nonNullable: true, validators: [...] }),
  age: new FormControl(0, { nonNullable: true, validators: [...] })
});
```

### Validadores Personalizados

```typescript
jsonValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  try {
    JSON.parse(control.value);
    return null;
  } catch (e) {
    return { invalidJson: true };
  }
}

// Uso
configJson: new FormControl('{}', [this.jsonValidator])
```

---

## 9. MULTI-TENANT ARCHITECTURE

### TenantService - Contexto

```typescript
@Injectable({ providedIn: 'root' })
export class TenantService {
  // Tenant activo (usado para X-Tenant-Id)
  private activeTenantIdSubject = new BehaviorSubject<string | null>();
  public currentTenantId$ = this.activeTenantIdSubject.asObservable();
  
  // Inicializar desde login
  initFromAuth(tenants: AuthUserTenant[], defaultTenantId?: string): void {
    // Estrategia de selección:
    // 1. Si hay tenant en localStorage (válido)
    // 2. Si hay defaultTenantId
    // 3. Primer tenant de la lista
    // 4. null (para superadmins)
  }
  
  setActiveTenant(tenantId: string | null): void { }
  getCurrentTenantId(): string | null { }
  getActiveTenant(): AuthUserTenant | null { }
  hasTenant(): boolean { }
}
```

### TenantInterceptor - Aplicación

```typescript
export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  // No agregar X-Tenant-Id a endpoints globales:
  const globalEndpoints = [
    '/auth/login',
    '/auth/register',
    '/auth/me',
    '/auth/my-tenants',
    // ...
  ];
  
  if (isGlobalEndpoint) {
    return next(req);
  }
  
  // Agregar X-Tenant-Id para endpoints tenant-scoped
  const tenantId = tenantService.getCurrentTenantId();
  if (!tenantId) {
    return next(req);
  }
  
  return next(req.clone({
    setHeaders: { 'X-Tenant-Id': tenantId }
  }));
};
```

### GuardTenant - Protección

```typescript
export const tenantRequiredGuard: CanActivateFn = (route, state) => {
  const tenantService = inject(TenantService);
  const router = inject(Router);
  
  if (!tenantService.hasTenant()) {
    router.navigate(['/select-tenant']);
    return false;
  }
  
  return true;
};
```

---

## 10. RESUMEN DE MEJORES PRÁCTICAS

### Inyección de Dependencias
```typescript
// Usar inject() en lugar de constructor
private readonly service = inject(MyService);
```

### RxJS
```typescript
// Usar takeUntil para limpiar suscripciones
.pipe(takeUntil(this.destroy$))

// Usar tap para efectos secundarios sin cambiar el flujo
.pipe(tap(data => this.flowsSubject.next(data)))
```

### Componentes Standalone
- Importar módulos necesarios en `imports`
- Inyectar servicios en `providers` si no son root
- Usar `changeDetection: OnPush` para optimizar

### Guards & Interceptors
- Usar versiones funcionales (`CanActivateFn`, `HttpInterceptorFn`)
- Inyectar dependencias con `inject()`
- Mantener lógica simple y clara

### Modelos & DTOs
- Separar interfaces de request (DTO) vs response (Entity)
- Definir interfaces comunes en models/
- Documentar con JSDoc

### Servicios
- Un servicio por dominio/recurso
- Exponer estado como observables públicos
- Manejar loading state internamente
- Usar tap() para actualizar estado

### Componentes
- Standalone: true
- Seguir patrón List-Form-Detail
- Implementar OnInit, OnDestroy
- Usar FormGroup tipado en formularios
- Inyectar MessageService, ConfirmationService para PrimeNG

### Estilos
- Usar PrimeFlex para layouts
- Respetar tema Aura
- Componentes responsive
- Variables CSS de PrimeNG

