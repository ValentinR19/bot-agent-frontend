# Índice de Documentación - Bot Agent Frontend

Este documento es un índice de toda la documentación disponible para el proyecto.

---

## Documentos Disponibles

### 1. PROJECT_PATTERNS.md
**Descripción**: Análisis completo de la estructura y patrones del proyecto

**Contenidos**:
- 1. Organización de features (Flows, Channels)
- 2. Estructura de servicios en core/
- 3. Patrones de componentes standalone
- 4. Configuración de routing (3 niveles)
- 5. Uso de PrimeNG (módulos, servicios, configuración)
- 6. Patrones de respuesta API (modelos globales)
- 7. Patrones de ciclo de vida (OnInit, OnDestroy)
- 8. Patrones de formularios reactivos (tipado, validadores)
- 9. Multi-tenant architecture (TenantService, interceptor, guards)
- 10. Resumen de mejores prácticas

**Cuándo usarlo**: Cuando necesites entender la arquitectura general del proyecto o necesites referencia sobre patrones existentes.

**Archivos de ejemplo incluidos**:
- FlowsService, ChannelsService
- FlowsListComponent, FlowsFormComponent, FlowsDetailComponent
- HttpService, TenantService
- App routing, Guard and Interceptor patterns

---

### 2. ARCHITECTURE_DIAGRAM.md
**Descripción**: Diagramas visuales de la arquitectura del proyecto

**Contenidos**:
- 1. Estructura de carpetas (tree completo)
- 2. Flujo de datos (Data Flow)
- 3. Flujo de autenticación y multi-tenant
- 4. Ciclo de vida de un componente CRUD
- 5. Tree de dependencias (Inyección)
- 6. Componentes compartidos
- 7. Patrón de Feature (Context)
- 8. Estado de la aplicación (localStorage, BehaviorSubjects)
- 9. Ciclo de vida de una petición HTTP

**Cuándo usarlo**: Cuando necesites visualizar cómo se comunican los componentes, flujo de datos, o entender la estructura física del proyecto.

**Diagramas ASCII incluidos**: Múltiples diagramas de flujo paso a paso.

---

### 3. NEW_FEATURE_CHECKLIST.md
**Descripción**: Checklist completo para crear un nuevo feature/contexto

**Contenidos**:
- 1. Estructura de carpetas
- 2. Modelos (interfaces, DTOs)
- 3. Servicios (métodos CRUD, patrón de mini-store)
- 4. Componentes (List, Form, Detail)
- 5. Rutas (3 niveles)
- 6. Integraciones en app routes
- 7. Componentes compartidos
- 8. Patrones de código (inyección, suscripciones, lifecycle)
- 9. Estilos y responsividad
- 10. Documentación
- 11. Testing
- 12. Notas importantes (multi-tenant, paginación, lazy loading)
- 13. Validación final

**Cuándo usarlo**: Cuando estés creando un nuevo feature/contexto. Úsalo como checklist para asegurar consistencia.

**Proporciona**: Templates de código, ejemplos, estructura recomendada.

---

## Flujo de Uso Recomendado

### Desarrollo Inicial
1. Lee **PROJECT_PATTERNS.md** sección 1-5 para entender estructura general
2. Consulta **ARCHITECTURE_DIAGRAM.md** para visualizar flujos
3. Usa **NEW_FEATURE_CHECKLIST.md** para crear tu feature

### Durante el Desarrollo
- Consulta **PROJECT_PATTERNS.md** para validar patrones usados
- Usa **NEW_FEATURE_CHECKLIST.md** como checklist de validación
- Revisa **ARCHITECTURE_DIAGRAM.md** si tienes dudas sobre flujos

### Onboarding de Nuevos Desarrolladores
1. Empieza con **ARCHITECTURE_DIAGRAM.md** sección 1-3 (estructura y flujos)
2. Lee **PROJECT_PATTERNS.md** sección 1, 3, 5, 9, 10
3. Referencia **NEW_FEATURE_CHECKLIST.md** para crear features

---

## Resumen Rápido de Patrones Clave

### Estructura por Feature
```
contexts/[feature]/
├── models/[entity].model.ts
├── services/[entity].service.ts
├── views/
│   ├── [entity]-list/
│   ├── [entity]-form/
│   └── [entity]-detail/
└── [feature].routes.ts
```

### Componente Standalone Mínimo
```typescript
@Component({
  selector: 'app-[entity]-list',
  standalone: true,
  imports: [CommonModule, PrimeNG modules, Shared components],
  providers: [MessageService, ConfirmationService],
})
export class [Entity]ListComponent implements OnInit, OnDestroy {
  private readonly [entity]Service = inject([Entity]Service);
  private readonly destroy$ = new Subject<void>();
  
  ngOnInit(): void { /* load data */ }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
```

### Servicio Patrón
```typescript
@Injectable({ providedIn: 'root' })
export class [Entity]Service {
  private readonly http = inject(HttpService);
  private [entities]Subject = new BehaviorSubject<[Entity][]>([]);
  public [entities]$ = this.[entities]Subject.asObservable();
  
  findAll(): Observable<PaginatedResponse<[Entity]>> {
    return this.http.get<PaginatedResponse<[Entity]>>(baseUrl)
      .pipe(tap(response => this.[entities]Subject.next(response.data)));
  }
}
```

### Routing Patrón
```typescript
// app.routes.ts
{ path: '[entities]', loadChildren: () => import(...).then(m => m.[FEATURE]_ROUTES) }

// [feature].routes.ts
export const [FEATURE]_ROUTES: Routes = [
  { path: '', children: [
    { path: '', loadChildren: () => import(...list.routes) },
    { path: 'new', loadChildren: () => import(...form.routes) },
    { path: ':id', loadChildren: () => import(...detail.routes) },
    { path: ':id/edit', loadChildren: () => import(...form.routes) }
  ]}
];
```

---

## Archivos Relacionados en el Proyecto

### Configuración
- `src/app/app.config.ts` - Configuración global (PrimeNG, interceptores)
- `src/app/app.routes.ts` - Rutas principales
- `angular.json` - Configuración de Angular CLI

### Core (Servicios y Guards)
- `src/app/core/guards/` - Protección de rutas
- `src/app/core/interceptors/` - Interceptores HTTP
- `src/app/core/http/http.service.ts` - Wrapper centralizado de HttpClient
- `src/app/core/services/tenant.service.ts` - Contexto multi-tenant

### Shared (Componentes Reutilizables)
- `src/app/shared/components/custom-table/` - Tabla genérica
- `src/app/shared/components/custom-form/` - Formulario genérico
- `src/app/shared/components/page-header/` - Header de páginas
- `src/app/shared/models/pagination.model.ts` - Modelos de paginación

### Contexts (Features)
- `src/app/contexts/flows/` - Feature de Flujos
- `src/app/contexts/channels/` - Feature de Canales
- `src/app/contexts/[other features]/` - Otros features

### Layout
- `src/app/layout/main-layout/` - Layout principal
- `src/app/layout/sidebar/` - Barra lateral
- `src/app/layout/topbar/` - Barra superior

---

## Versiones y Dependencias

- **Angular**: 19.0.0
- **PrimeNG**: 19.0.0
- **RxJS**: 7.8.0
- **TypeScript**: 5.6.3

Ver `package.json` para lista completa.

---

## Preguntas Frecuentes

### ¿Cómo creo un nuevo feature?
1. Consulta **NEW_FEATURE_CHECKLIST.md** sección completa
2. Copia la estructura de un feature existente (flows o channels)
3. Usa los templates proporcionados

### ¿Cómo funciona la autenticación multi-tenant?
Consulta **PROJECT_PATTERNS.md** sección 9 y **ARCHITECTURE_DIAGRAM.md** sección 3.

### ¿Cómo implementar paginación?
- El servicio retorna `PaginatedResponse<T>` automáticamente
- Los componentes acceden a `response.data` y `response.meta`
- CustomTableComponent soporta paginación out-of-the-box

### ¿Cómo agregar un nuevo módulo PrimeNG?
1. Importa el módulo en el componente que lo usa
2. Asegúrate de que esté en el array `imports`
3. Usa los componentes según la documentación de PrimeNG

### ¿Cómo manejar errores de peticiones HTTP?
El `httpErrorInterceptor` maneja automáticamente:
- Errores 401 → Redirige a login
- Errores 403 → Muestra forbidden
- Otros errores → Muestra toast de error

### ¿Cómo implementar validadores personalizados?
Ver **PROJECT_PATTERNS.md** sección 8 y **NEW_FEATURE_CHECKLIST.md** sección 4.

---

## Contribuciones y Mejoras

Si encuentras que algún patrón no se sigue, o si necesitas agregar nueva documentación:

1. Verifica que el patrón esté documentado en estos archivos
2. Si está documentado, asegúrate de seguirlo
3. Si no está documentado, crea un issue o agrega a la documentación

---

## Contacto

Para preguntas sobre la arquitectura o patrones:
- Consulta los documentos de este índice
- Revisa el código existente (flows, channels)
- Verifica los examples en los documentos

---

**Última actualización**: 2025-11-20
**Versión de la documentación**: 1.0
**Aplicable a**: Angular 19, PrimeNG 19

