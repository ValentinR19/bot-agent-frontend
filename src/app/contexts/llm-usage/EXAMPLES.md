# LLM-USAGE Context - Ejemplos de Uso

## 1. Integración de Rutas

### Opción A: Rutas directas

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { LLM_USAGE_ROUTES } from './contexts/llm-usage';

export const routes: Routes = [
  // Otras rutas...
  {
    path: 'llm-usage',
    children: LLM_USAGE_ROUTES,
  },
];
```

### Opción B: Lazy Loading (Recomendado)

```typescript
// app.routes.ts
export const routes: Routes = [
  // Otras rutas...
  {
    path: 'llm-usage',
    loadChildren: () =>
      import('./contexts/llm-usage').then(m => m.LLM_USAGE_ROUTES),
  },
];
```

## 2. Uso del Servicio

### En un Componente

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { LlmUsageService, LLMUsageStats } from './contexts/llm-usage';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <p>Costo total: ${{ stats?.totalCost }}</p>
  `,
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats: LLMUsageStats | null = null;
  private destroy$ = new Subject<void>();

  constructor(private llmService: LlmUsageService) {}

  ngOnInit(): void {
    this.llmService
      .getUsageStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => {
        this.stats = stats;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### En otro Servicio

```typescript
import { Injectable } from '@angular/core';
import { LlmUsageService, LLMUsageRecord } from './contexts/llm-usage';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class BillingService {
  constructor(private llmUsageService: LlmUsageService) {}

  getMonthlyInvoice(): Observable<number> {
    return this.llmUsageService.getUsageRecords().pipe(
      map(records => {
        return records.reduce((total, record) => total + record.cost, 0);
      })
    );
  }

  getAverageTokensPerRequest(): Observable<number> {
    return this.llmUsageService.getUsageRecords().pipe(
      map(records => {
        if (records.length === 0) return 0;
        const totalTokens = records.reduce(
          (sum, r) => sum + r.totalTokens,
          0
        );
        return totalTokens / records.length;
      })
    );
  }
}
```

## 3. Importaciones Limpias

```typescript
// ✓ Buen uso - Usar index.ts
import {
  LLM_USAGE_ROUTES,
  LlmUsageService,
  LlmUsageComponent,
  type LLMUsageRecord,
  type LLMUsageStats,
} from '@/contexts/llm-usage';

// ✗ Evitar - Rutas muy largas
import { LlmUsageService } from '@/contexts/llm-usage/services/llm-usage.service';
```

## 4. Actualizar el Servicio con API Real

Cuando tengas el backend listo:

```typescript
// llm-usage.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LlmUsageService {
  private apiUrl = '/api/llm-usage';

  constructor(private http: HttpClient) {}

  getUsageRecords(): Observable<LLMUsageRecord[]> {
    return this.http.get<LLMUsageRecord[]>(`${this.apiUrl}/records`);
  }

  getUsageStats(): Observable<LLMUsageStats> {
    return this.http.get<LLMUsageStats>(`${this.apiUrl}/stats`);
  }
}
```

## 5. Testing

### Test del Componente

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LlmUsageComponent } from './llm-usage.component';
import { LlmUsageService } from '../../services/llm-usage.service';
import { of } from 'rxjs';

describe('LlmUsageComponent', () => {
  let component: LlmUsageComponent;
  let fixture: ComponentFixture<LlmUsageComponent>;
  let mockService: jasmine.SpyObj<LlmUsageService>;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('LlmUsageService', [
      'getUsageRecords',
      'getUsageStats',
    ]);

    await TestBed.configureTestingModule({
      imports: [LlmUsageComponent],
      providers: [{ provide: LlmUsageService, useValue: mockService }],
    }).compileComponents();

    mockService.getUsageRecords.and.returnValue(
      of([
        {
          date: '2025-11-18',
          model: 'gpt-4',
          promptTokens: 1500,
          completionTokens: 800,
          totalTokens: 2300,
          cost: 0.046,
        },
      ])
    );

    mockService.getUsageStats.and.returnValue(
      of({
        totalCost: 0.115,
        totalTokens: 7100,
        avgCostPerRequest: 0.038,
      })
    );

    fixture = TestBed.createComponent(LlmUsageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load usage records on init', () => {
    expect(component.usageData.length).toBeGreaterThan(0);
    expect(mockService.getUsageRecords).toHaveBeenCalled();
  });

  it('should load stats on init', () => {
    expect(component.totalStats.totalCost).toBe(0.115);
    expect(mockService.getUsageStats).toHaveBeenCalled();
  });
});
```

## 6. Extender el Servicio

### Agregar nuevo método

```typescript
export class LlmUsageService {
  // ... métodos existentes

  /**
   * Obtener costo total por modelo
   */
  getCostByModel(model: string): Observable<number> {
    return this.getUsageRecords().pipe(
      map(records =>
        records
          .filter(r => r.model === model)
          .reduce((sum, r) => sum + r.cost, 0)
      )
    );
  }

  /**
   * Obtener registros en un rango de fechas
   */
  getRecordsByDateRange(
    startDate: Date,
    endDate: Date
  ): Observable<LLMUsageRecord[]> {
    return this.getUsageRecords().pipe(
      map(records =>
        records.filter(r => {
          const date = new Date(r.date);
          return date >= startDate && date <= endDate;
        })
      )
    );
  }
}
```

## 7. Integración con Dashboard

```typescript
import { Component, OnInit } from '@angular/core';
import { LlmUsageService } from './contexts/llm-usage';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="dashboard">
      <h2>Dashboard de LLM</h2>
      <a routerLink="/llm-usage">Ver detalles de uso</a>

      <div>
        <h3>Resumen</h3>
        <p *ngIf="stats">Costo total: ${{ stats.totalCost }}</p>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  stats = null;

  constructor(private llmService: LlmUsageService) {}

  ngOnInit(): void {
    this.llmService.getUsageStats().subscribe(stats => {
      this.stats = stats;
    });
  }
}
```

## Notas Importantes

1. **Memory Leaks**: Siempre implementa `OnDestroy` con `takeUntil`
2. **Tipado**: Usa los tipos de `/models/` para mejor type-safety
3. **Lazy Loading**: Usa `loadChildren` en rutas para mejor performance
4. **Testing**: Mockea el servicio en tests del componente
5. **API**: Reemplaza la data mockeada con llamadas HTTP cuando esté listo el backend
