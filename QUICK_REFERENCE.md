# Quick Reference - Patrones del Proyecto

Referencia rápida de los patrones más comunes. Para detalles, consulta los documentos principales.

---

## Estructura de un Feature

```
contexts/[feature]/
├── models/[entity].model.ts           # Interfaces, DTOs
├── services/[entity].service.ts       # Lógica CRUD
├── views/
│   ├── [entity]-list/
│   ├── [entity]-form/
│   └── [entity]-detail/
└── [feature].routes.ts                # Rutas
```

---

## Servicio CRUD Mínimo

```typescript
@Injectable({ providedIn: 'root' })
export class [Entity]Service {
  private readonly http = inject(HttpService);
  private readonly baseUrl = '/[entities]';
  
  // Estado (mini-store)
  private [entities]Subject = new BehaviorSubject<[Entity][]>([]);
  public [entities]$ = this.[entities]Subject.asObservable();
  
  // CRUD
  findAll(): Observable<PaginatedResponse<[Entity]>> {
    return this.http.get<PaginatedResponse<[Entity]>>(this.baseUrl).pipe(
      tap(res => this.[entities]Subject.next(res.data))
    );
  }
  
  create(dto: Create[Entity]Dto): Observable<[Entity]> {
    return this.http.post<[Entity]>(this.baseUrl, dto).pipe(
      tap(item => {
        const current = this.[entities]Subject.value;
        this.[entities]Subject.next([...current, item]);
      })
    );
  }
  
  update(id: string, dto: Update[Entity]Dto): Observable<[Entity]> {
    return this.http.put<[Entity]>(`${this.baseUrl}/${id}`, dto).pipe(
      tap(item => {
        const current = this.[entities]Subject.value;
        const idx = current.findIndex(e => e.id === id);
        if (idx !== -1) {
          current[idx] = item;
          this.[entities]Subject.next([...current]);
        }
      })
    );
  }
  
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        const current = this.[entities]Subject.value;
        this.[entities]Subject.next(current.filter(e => e.id !== id));
      })
    );
  }
}
```

---

## Componente List Mínimo

```typescript
@Component({
  selector: 'app-[entity]-list',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    CustomTableComponent,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './[entity]-list.component.html',
  styleUrl: './[entity]-list.component.scss',
})
export class [Entity]ListComponent implements OnInit, OnDestroy {
  private readonly service = inject([Entity]Service);
  private readonly router = inject(Router);
  private readonly msg = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);
  private readonly destroy$ = new Subject<void>();

  [entities]: [Entity][] = [];
  loading = false;

  columns: TableColumn[] = [
    { field: 'name', header: 'Nombre', sortable: true },
  ];

  actions: TableAction[] = [
    { label: 'Ver', icon: 'pi pi-eye', command: (i) => this.view(i) },
    { label: 'Editar', icon: 'pi pi-pencil', command: (i) => this.edit(i) },
    { label: 'Eliminar', icon: 'pi pi-trash', command: (i) => this.delete(i) },
  ];

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    this.loading = true;
    this.service
      .findAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.[entities] = res.data;
          this.loading = false;
        },
        error: () => {
          this.msg.add({ severity: 'error', detail: 'Error al cargar' });
          this.loading = false;
        },
      });
  }

  view(item: [Entity]): void {
    this.router.navigate(['/', this.router.url.split('/')[1], item.id]);
  }

  edit(item: [Entity]): void {
    this.router.navigate(['/', this.router.url.split('/')[1], item.id, 'edit']);
  }

  delete(item: [Entity]): void {
    this.confirm.confirm({
      message: `¿Eliminar ${item.name}?`,
      accept: () => {
        this.service
          .delete(item.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.msg.add({ severity: 'success', detail: 'Eliminado' });
              this.load();
            },
          });
      },
    });
  }
}
```

---

## Componente Form Mínimo

```typescript
interface [Entity]Controls {
  name: FormControl<string>;
  description: FormControl<string>;
}

@Component({
  selector: 'app-[entity]-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, ToastModule],
  providers: [MessageService],
  templateUrl: './[entity]-form.component.html',
  styleUrl: './[entity]-form.component.scss',
})
export class [Entity]FormComponent implements OnInit, OnDestroy {
  private readonly service = inject([Entity]Service);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly msg = inject(MessageService);
  private readonly destroy$ = new Subject<void>();

  form!: FormGroup<[Entity]Controls>;
  isEdit = false;
  id: string | null = null;
  saving = false;

  ngOnInit(): void {
    this.initForm();
    this.id = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.id;
    
    if (this.isEdit && this.id) {
      this.load(this.id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.form = new FormGroup<[Entity]Controls>({
      name: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      description: new FormControl('', { nonNullable: true }),
    });
  }

  load(id: string): void {
    this.service
      .findOne(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (item) => {
          this.form.patchValue(item);
        },
      });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.saving = true;
      const request = this.isEdit && this.id
        ? this.service.update(this.id, this.form.value)
        : this.service.create({ ...this.form.value, tenantId: '' });

      request.pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.msg.add({ severity: 'success', detail: 'Guardado' });
          this.back();
        },
        error: () => {
          this.msg.add({ severity: 'error', detail: 'Error' });
          this.saving = false;
        },
      });
    }
  }

  back(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
```

---

## Routing

**En app.routes.ts:**
```typescript
{
  path: '[entities]',
  loadChildren: () => import('./contexts/[feature]/[feature].routes')
    .then(m => m.[FEATURE]_ROUTES),
  canActivate: [tenantRequiredGuard]
}
```

**En [feature].routes.ts:**
```typescript
export const [FEATURE]_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', loadChildren: () => import('./views/[entity]-list/[entity]-list.routes').then(m => m.[ENTITY]_LIST_ROUTES) },
      { path: 'new', loadChildren: () => import('./views/[entity]-form/[entity]-form.routes').then(m => m.[ENTITY]_FORM_ROUTES) },
      { path: ':id', loadChildren: () => import('./views/[entity]-detail/[entity]-detail.routes').then(m => m.[ENTITY]_DETAIL_ROUTES) },
      { path: ':id/edit', loadChildren: () => import('./views/[entity]-form/[entity]-form.routes').then(m => m.[ENTITY]_FORM_ROUTES) },
    ],
  },
];
```

---

## Modelos

```typescript
export interface [Entity] {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Create[Entity]Dto {
  tenantId: string;
  name: string;
  description?: string;
}

export interface Update[Entity]Dto {
  name?: string;
  description?: string;
}
```

---

## PrimeNG Comunes

**Toast**:
```typescript
this.messageService.add({
  severity: 'success|error|warn|info',
  summary: 'Título',
  detail: 'Mensaje'
});
```

**Confirmación**:
```typescript
this.confirmationService.confirm({
  message: '¿Está seguro?',
  accept: () => { /* hacer algo */ }
});
```

---

## Mejores Prácticas

1. Inyecta con `inject()`:
   ```typescript
   private readonly service = inject(ServiceClass);
   ```

2. Cleanup de suscripciones:
   ```typescript
   .pipe(takeUntil(this.destroy$))
   ```

3. FormGroup tipado:
   ```typescript
   form!: FormGroup<MisControles>;
   ```

4. Componentes standalone:
   ```typescript
   standalone: true,
   imports: [CommonModule, OtrosModulos]
   ```

5. Respuestas paginadas:
   ```typescript
   next: (res: any) => {
     this.items = res.data;  // Acceder a .data
   }
   ```

---

## Documentación Completa

Para más detalles, consulta:
- **PROJECT_PATTERNS.md** - Patrones en detalle
- **ARCHITECTURE_DIAGRAM.md** - Diagramas visuales
- **NEW_FEATURE_CHECKLIST.md** - Checklist completo
- **DOCUMENTATION_INDEX.md** - Índice

