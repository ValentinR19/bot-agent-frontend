# LLM-USAGE Context - Guía de Integración

## Descripción
Este contexto encapsula toda la funcionalidad relacionada con el tracking de uso de LLM, incluyendo costos y tokens consumidos.

## Estructura

```
src/app/contexts/llm-usage/
├── models/
│   └── llm-usage.model.ts          # Interfaces de datos
├── services/
│   └── llm-usage.service.ts        # Lógica de negocio
├── views/
│   └── llm-usage/
│       ├── llm-usage.component.ts   # Componente de presentación
│       ├── llm-usage.component.html # Template
│       ├── llm-usage.component.scss # Estilos
│       └── llm-usage.routes.ts      # Rutas de vista
├── llm-usage.routes.ts             # Rutas principales
├── index.ts                        # Exportaciones
└── INTEGRATION.md                  # Este archivo
```

## Uso en Rutas

### Opción 1: Importar las rutas directamente

```typescript
// app.routes.ts
import { LLM_USAGE_ROUTES } from './contexts/llm-usage';

export const routes: Routes = [
  {
    path: 'llm-usage',
    children: LLM_USAGE_ROUTES,
  },
  // ... otras rutas
];
```

### Opción 2: Usar loadChildren para lazy loading

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'llm-usage',
    loadChildren: () =>
      import('./contexts/llm-usage').then(m => m.LLM_USAGE_ROUTES),
  },
  // ... otras rutas
];
```

## Uso del Servicio

El servicio está disponible en todo el árbol de componentes:

```typescript
import { LlmUsageService } from './contexts/llm-usage';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // ...
})
export class DashboardComponent {
  constructor(private llmService: LlmUsageService) {}

  ngOnInit(): void {
    this.llmService.getUsageStats().subscribe(stats => {
      console.log('Total cost:', stats.totalCost);
    });
  }
}
```

## Modelos

Tipos disponibles para importar:

```typescript
import type { LLMUsageRecord, LLMUsageStats } from './contexts/llm-usage';
```

## Características

- **OnDestroy**: Implementado correctamente con takeUntil
- **Tipado**: Interfaces completas para LLMUsageRecord y LLMUsageStats
- **Standalone**: Componente standalone moderno
- **Modular**: Fácil de mantener y extender
- **Lazy Loading**: Soporta lazy loading de rutas

## Notas de Migración

Si vienes de `src/app/features/llm-usage/`:

1. Actualiza los imports a:
   ```typescript
   import { LlmUsageComponent } from './contexts/llm-usage';
   ```

2. Usa las rutas desde:
   ```typescript
   import { LLM_USAGE_ROUTES } from './contexts/llm-usage';
   ```

3. El servicio sigue siendo singleton en `root`:
   ```typescript
   import { LlmUsageService } from './contexts/llm-usage';
   ```

## Próximas Mejoras

- [ ] Integración con API backend (reemplazar mock data)
- [ ] Filtros y búsqueda en el historial
- [ ] Exportación de reportes (PDF, CSV)
- [ ] Gráficos de análisis de costos
- [ ] Alertas de límites de presupuesto
