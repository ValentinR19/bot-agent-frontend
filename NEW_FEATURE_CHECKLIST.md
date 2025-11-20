# Checklist para Crear un Nuevo Feature (Contexto)

Use este checklist como guía para asegurar consistencia al crear un nuevo feature en `contexts/[new-feature]/`

---

## 1. ESTRUCTURA DE CARPETAS

- [ ] Crear directorio: `src/app/contexts/[feature-name]/`
- [ ] Crear subdirectorio: `models/`
- [ ] Crear subdirectorio: `services/`
- [ ] Crear subdirectorio: `views/`

---

## 2. MODELOS (Models)

### `models/[entity].model.ts`
- [ ] Definir interface principal `Entity` (con id, tenantId, timestamps)
- [ ] Definir `CreateEntityDto` (para POST)
- [ ] Definir `UpdateEntityDto` (para PUT, campos opcionales)
- [ ] Definir `EntityResponseDto` (para respuestas, extend Entity)
- [ ] Documentar interfaces con JSDoc
- [ ] Usar tipos específicos (no `any`)
- [ ] Incluir optional chaining donde sea necesario

**Estructura recomendada:**
```typescript
/**
 * Entidad principal
 */
export interface Entity {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

/**
 * DTO para crear
 */
export interface CreateEntityDto {
  tenantId: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

/**
 * DTO para actualizar
 */
export interface UpdateEntityDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

/**
 * Respuesta del servidor
 */
export interface EntityResponseDto extends Entity {}
```

### `models/dtos/` (si hay DTOs complejos)
- [ ] Crear archivo por DTO si es muy complejo
- [ ] Ejemplos: `[entity]-setup.dto.ts`, `[entity]-config.dto.ts`

---

## 3. SERVICIOS (Services)

### `services/[entity].service.ts`

#### Estructura básica
```typescript
@Injectable({ providedIn: 'root' })
export class [Entity]Service {
  // Inyecciones
  private readonly http = inject(HttpService);
  private readonly baseUrl = '/[entities]';
  
  // Estado interno (mini-store)
  private [entities]Subject = new BehaviorSubject<[Entity][]>([]);
  public [entities]$ = this.[entities]Subject.asObservable();
  
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
}
```

#### Checklist de métodos CRUD
- [ ] `findAll()`: GET /[entities] → Observable<PaginatedResponse<[Entity]>>
- [ ] `findOne(id)`: GET /[entities]/{id} → Observable<[Entity]>
- [ ] `create(dto)`: POST /[entities] → Observable<[Entity]>
- [ ] `update(id, dto)`: PUT /[entities]/{id} → Observable<[Entity]>
- [ ] `delete(id)`: DELETE /[entities]/{id} → Observable<void>

#### Patrón de método CRUD
```typescript
findAll(): Observable<PaginatedResponse<[Entity]>> {
  this.loadingSubject.next(true);
  
  return this.http.get<PaginatedResponse<[Entity]>>(this.baseUrl).pipe(
    tap({
      next: (response) => {
        this.[entities]Subject.next(response.data);
        this.loadingSubject.next(false);
      },
      error: () => {
        this.loadingSubject.next(false);
      },
    }),
  );
}

create(dto: Create[Entity]Dto): Observable<[Entity]> {
  return this.http.post<[Entity]>(this.baseUrl, dto).pipe(
    tap((newEntity) => {
      const current = this.[entities]Subject.value;
      this.[entities]Subject.next([...current, newEntity]);
    }),
  );
}

update(id: string, dto: Update[Entity]Dto): Observable<[Entity]> {
  return this.http.put<[Entity]>(`${this.baseUrl}/${id}`, dto).pipe(
    tap((updated) => {
      const current = this.[entities]Subject.value;
      const index = current.findIndex((e) => e.id === id);
      if (index !== -1) {
        current[index] = updated;
        this.[entities]Subject.next([...current]);
      }
    }),
  );
}

delete(id: string): Observable<void> {
  return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
    tap(() => {
      const current = this.[entities]Subject.value;
      this.[entities]Subject.next(current.filter((e) => e.id !== id));
    }),
  );
}
```

#### Métodos especializados (si aplica)
- [ ] `search(query)`: POST /[entities]/search
- [ ] `findActive()`: GET /[entities]/active
- [ ] `findByType(type)`: GET /[entities]/type/{type}
- [ ] Otros métodos del dominio específico

#### Documentación
- [ ] Agregar JSDoc a cada método
- [ ] Comentar la URL del endpoint
- [ ] Documentar parámetros y retorno

---

## 4. COMPONENTES (Views)

### Estructura de archivos por vista
```
views/
├── [entity]-list/
│   ├── [entity]-list.component.ts
│   ├── [entity]-list.component.html
│   ├── [entity]-list.component.scss
│   └── [entity]-list.routes.ts
├── [entity]-form/
│   ├── [entity]-form.component.ts
│   ├── [entity]-form.component.html
│   ├── [entity]-form.component.scss
│   └── [entity]-form.routes.ts
└── [entity]-detail/
    ├── [entity]-detail.component.ts
    ├── [entity]-detail.component.html
    ├── [entity]-detail.component.scss
    └── [entity]-detail.routes.ts
```

### `[entity]-list.component.ts`

#### Checklist
- [ ] `standalone: true`
- [ ] Importar todos los módulos necesarios (CommonModule, PrimeNG, shared components)
- [ ] Inyectar: service, router, messageService, confirmationService
- [ ] Crear destroy$ para cleanup
- [ ] Implementar OnInit, OnDestroy
- [ ] Definir columns: TableColumn[] con field, header, sortable, filterable, type
- [ ] Definir actions: TableAction[] (view, edit, delete, custom)
- [ ] Método loadData() que llama al servicio
- [ ] Método crud (create, view, edit, delete)
- [ ] Usar CustomTableComponent
- [ ] Usar PageHeaderComponent
- [ ] Usar FilterPanelComponent (opcional)
- [ ] Usar PrimeNG: ButtonModule, ToastModule, ConfirmDialogModule
- [ ] Usar takeUntil en suscripciones
- [ ] Mostrar Toast en success/error
- [ ] Confirmación de eliminación
- [ ] Manejo de loading state

**Template mínimo:**
```html
<app-page-header [title]="'[Entities]'" [description]="'Manage [entities]'">
  <button pButton label="Nuevo" (click)="create()" icon="pi pi-plus"></button>
</app-page-header>

<app-custom-table
  [data]="[entities]"
  [columns]="columns"
  [actions]="actions"
  [loading]="loading"
></app-custom-table>
```

### `[entity]-form.component.ts`

#### Checklist
- [ ] `standalone: true`
- [ ] Importar: CommonModule, ReactiveFormsModule, PrimeNG modules
- [ ] Inyectar: service, route, router, messageService
- [ ] Crear destroy$
- [ ] Implementar OnInit, OnDestroy
- [ ] Crear FormGroup tipado (FormGroup<[Entity]FormControls>)
- [ ] Método initForm() con Validators
- [ ] Detectar modo (CREATE vs EDIT) en ngOnInit
- [ ] Cargar datos si EDIT
- [ ] Método onSubmit() que valida y llama servicio
- [ ] Manejar respuestas (success → navigate, error → show toast)
- [ ] Método goBack()
- [ ] Usar takeUntil en suscripciones
- [ ] Mostrar loading durante save
- [ ] Validadores personalizados si es necesario

**Estructura de FormGroup:**
```typescript
interface [Entity]FormControls {
  name: FormControl<string>;
  description: FormControl<string>;
  isActive: FormControl<boolean>;
  // ... más campos
}

this.form = new FormGroup<[Entity]FormControls>({
  name: new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3)]
  }),
  // ... más campos
});
```

**Template mínimo:**
```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <!-- Campos del formulario -->
  <div class="flex gap-2 justify-end">
    <button pButton label="Cancelar" (click)="goBack()"></button>
    <button pButton label="Guardar" type="submit" [loading]="saving"></button>
  </div>
</form>
```

### `[entity]-detail.component.ts`

#### Checklist
- [ ] `standalone: true`
- [ ] Importar: CommonModule, PrimeNG modules
- [ ] Inyectar: service, route, router, messageService
- [ ] Crear destroy$
- [ ] Implementar OnInit, OnDestroy
- [ ] Cargar datos en ngOnInit
- [ ] Mostrar loading skeleton mientras se carga
- [ ] Botones: Edit, Delete, Back
- [ ] Usar takeUntil en suscripciones
- [ ] Mostrar datos en formato legible
- [ ] Manejar errores con toast

---

## 5. RUTAS

### `[feature].routes.ts` (Main routes file)
```typescript
export const [FEATURE]_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./views/[entity]-list/[entity]-list.routes')
          .then((m) => m.[ENTITY]_LIST_ROUTES),
      },
      {
        path: 'new',
        loadChildren: () => import('./views/[entity]-form/[entity]-form.routes')
          .then((m) => m.[ENTITY]_FORM_ROUTES),
      },
      {
        path: ':id',
        loadChildren: () => import('./views/[entity]-detail/[entity]-detail.routes')
          .then((m) => m.[ENTITY]_DETAIL_ROUTES),
      },
      {
        path: ':id/edit',
        loadChildren: () => import('./views/[entity]-form/[entity]-form.routes')
          .then((m) => m.[ENTITY]_FORM_ROUTES),
      },
    ],
  },
];
```

- [ ] Definir rutas para list, form (new), detail, form (edit)
- [ ] Usar lazy loading con loadChildren
- [ ] Exportar constante [FEATURE]_ROUTES
- [ ] Aplicar authGuard si es necesario

### `views/[entity]-list/[entity]-list.routes.ts`
```typescript
export const [ENTITY]_LIST_ROUTES: Routes = [
  {
    path: '',
    component: [Entity]ListComponent,
  },
];
```

- [ ] Una sola ruta apuntando al componente
- [ ] Nombre de constante: [ENTITY]_LIST_ROUTES

---

## 6. INTEGRACIONES EN APP ROUTES

En `app.routes.ts`:

```typescript
{
  path: '[entities]',
  loadChildren: () => import('./contexts/[feature]/[feature].routes')
    .then((m) => m.[FEATURE]_ROUTES),
  canActivate: [tenantRequiredGuard], // Si es tenant-scoped
},
```

- [ ] Agregar ruta en app.routes.ts
- [ ] Aplicar tenantRequiredGuard si es tenant-scoped
- [ ] Usar loadChildren
- [ ] Nombre de ruta es plural y descriptivo

---

## 7. COMPONENTES COMPARTIDOS

### Uso de componentes existentes
- [ ] CustomTableComponent para listas
- [ ] PageHeaderComponent en header de listas
- [ ] CustomFormComponent (opcional, para formularios genéricos)
- [ ] FilterPanelComponent (opcional, para búsquedas)
- [ ] CustomModalComponent (opcional, para modales)
- [ ] PrimeNG módulos necesarios

### PrimeNG imports (lista mínima)
```typescript
imports: [
  CommonModule,
  CardModule,           // Layouts
  ButtonModule,         // Botones
  InputTextModule,      // Inputs texto
  TextareaModule,       // Text areas
  SelectModule,         // Selects
  ToggleSwitchModule,   // Toggles
  DatePickerModule,     // Datepickers
  ToastModule,          // Notificaciones
  ConfirmDialogModule,  // Confirmaciones
  TableModule,          // Tablas
  PageHeaderComponent,  // Nuestro header
  CustomTableComponent, // Nuestra tabla
]
```

---

## 8. PATRONES DE CÓDIGO

### Inyección de dependencias
```typescript
private readonly service = inject(ServiceClass);
private readonly router = inject(Router);
private readonly destroy$ = new Subject<void>();
```

### Suscripciones
```typescript
this.service
  .getData()
  .pipe(takeUntil(this.destroy$))
  .subscribe({
    next: (data) => {
      // Handle success
    },
    error: () => {
      // Handle error
    },
  });
```

### Lifecycle
```typescript
ngOnInit(): void {
  this.loadData();
}

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}
```

### Validación de formularios
```typescript
if (this.form.valid) {
  // Submit
} else {
  this.form.markAllAsTouched();
}
```

### Mensajes (Toast)
```typescript
this.messageService.add({
  severity: 'success|error|warn|info',
  summary: 'Título',
  detail: 'Mensaje detallado',
});
```

### Confirmación
```typescript
this.confirmationService.confirm({
  message: '¿Está seguro?',
  accept: () => {
    // Ejecutar si acepta
  },
});
```

---

## 9. ESTILOS Y RESPONSIVIDAD

- [ ] Usar PrimeFlex para layouts
- [ ] Responsive en mobile (gap, flex, grid)
- [ ] Respectar colores y variables CSS de PrimeNG Aura
- [ ] Evitar hard-coded colors (usar variables CSS)
- [ ] Test en múltiples resoluciones

---

## 10. DOCUMENTACIÓN

- [ ] Comentar código complejo
- [ ] JSDoc en servicios y métodos públicos
- [ ] Comentar propósito de componentes
- [ ] Explicar endpoints si no son obvios
- [ ] Documentar validadores especiales

---

## 11. TESTING (Opcional pero recomendado)

- [ ] Crear `[entity].service.spec.ts`
- [ ] Crear `[entity]-list.component.spec.ts`
- [ ] Crear `[entity]-form.component.spec.ts`
- [ ] Tests para métodos principales del servicio
- [ ] Tests para ciclo de vida del componente
- [ ] Tests para validación de formularios

---

## 12. NOTAS IMPORTANTES

### Multi-Tenant
- Si el feature es tenant-scoped:
  - Aplicar `canActivate: [tenantRequiredGuard]` en rutas
  - El interceptor agregará automáticamente `X-Tenant-Id`
  - En DTOs de CREATE, setear `tenantId: ''` (lo maneja el backend)

### Paginación
- Si findAll() retorna `PaginatedResponse<T>`:
  - Acceder a datos con `response.data`
  - Acceder a meta con `response.meta`
  - CustomTableComponent soporta paginación automáticamente

### Lazy Loading
- Cada vista se carga lazy
- Mejora performance
- Reduce bundle size

### Standalone Components
- Todos los componentes son standalone
- Importar explícitamente módulos necesarios
- Proveer servicios en providers si no son root

---

## 13. VALIDACIÓN FINAL

Antes de mergear:

- [ ] Todas las rutas funcionan (list, new, edit, detail)
- [ ] CRUD completo funciona (create, read, update, delete)
- [ ] Toast/notificaciones funcionan
- [ ] Confirmaciones funcionan
- [ ] Manejo de errores en lugar
- [ ] Loading states visibles
- [ ] Responsive en mobile
- [ ] Sin console errors
- [ ] Código formateado (prettier)
- [ ] JSDoc completo

---

## Ejemplo Completo: Feature "Products"

```
contexts/products/
├── models/
│   ├── product.model.ts
│   └── dtos/
│       └── product-category.dto.ts
├── services/
│   └── products.service.ts
├── views/
│   ├── products-list/
│   ├── products-form/
│   └── products-detail/
└── products.routes.ts
```

Para copiar este patrón, simplemente reemplaza `[entity]` con el nombre de tu entidad.

