import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpService } from '../../../core/http/http.service';
import { CatalogItem, CatalogItemType, CatalogSearchParams, CreateCatalogItemDto, UpdateCatalogItemDto, UpdateStockDto } from '../models/catalog.model';
import { PaginatedResponse } from '../../../shared/models/pagination.model';

/**
 * Servicio para gestión de Catalog (productos/servicios)
 * Endpoints generados desde swagger-export.json
 */
@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  private readonly http = inject(HttpService);
  private readonly baseUrl = '/catalog';

  // Estado interno (mini-store)
  private catalogItemsSubject = new BehaviorSubject<CatalogItem[]>([]);
  public catalogItems$ = this.catalogItemsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  /**
   * GET /api/v1/catalog
   * Listar todos los items del catálogo
   */
  findAll(): Observable<PaginatedResponse<CatalogItem>> {
    this.loadingSubject.next(true);

    return this.http.get<PaginatedResponse<CatalogItem>>(this.baseUrl).pipe(
      tap({
        next: (response) => {
          this.catalogItemsSubject.next(response.data);
          this.loadingSubject.next(false);
        },
        error: () => {
          this.loadingSubject.next(false);
        },
      }),
    );
  }

  private toRecord(paramsObj: any): Record<string, string> {
    const record: Record<string, string> = {};

    Object.entries(paramsObj).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        record[key] = String(value);
      }
    });

    return record;
  }

  /**
   * GET /api/v1/catalog/search
   * Buscar items del catálogo
   */
  search(params: CatalogSearchParams): Observable<PaginatedResponse<CatalogItem>> {
    const queryObj: any = {
      q: params.q,
      type: params.type,
      tags: params.tags?.length ? params.tags.join(',') : undefined,
      isActive: params.isActive,
      isFeatured: params.isFeatured,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      page: params.page,
      limit: params.limit,
    };

    const finalParams = this.toRecord(queryObj);

    return this.http.get<PaginatedResponse<CatalogItem>>(`${this.baseUrl}/search`, {
      params: finalParams,
    });
  }

  /**
   * GET /api/v1/catalog/featured
   * Obtener items destacados
   */
  findFeatured(): Observable<PaginatedResponse<CatalogItem>> {
    return this.http.get<PaginatedResponse<CatalogItem>>(`${this.baseUrl}/featured`);
  }

  /**
   * GET /api/v1/catalog/type/{type}
   * Listar items por tipo
   */
  findByType(type: CatalogItemType): Observable<PaginatedResponse<CatalogItem>> {
    return this.http.get<PaginatedResponse<CatalogItem>>(`${this.baseUrl}/type/${type}`);
  }

  /**
   * GET /api/v1/catalog/sku/{sku}
   * Obtener item por SKU
   */
  findBySku(sku: string): Observable<CatalogItem> {
    return this.http.get<CatalogItem>(`${this.baseUrl}/sku/${sku}`);
  }

  /**
   * GET /api/v1/catalog/{id}
   * Obtener un item por ID
   */
  findOne(id: string): Observable<CatalogItem> {
    return this.http.get<CatalogItem>(`${this.baseUrl}/${id}`);
  }

  /**
   * POST /api/v1/catalog
   * Crear un nuevo item
   */
  create(dto: CreateCatalogItemDto): Observable<CatalogItem> {
    return this.http.post<CatalogItem>(this.baseUrl, dto).pipe(
      tap((newItem) => {
        const currentItems = this.catalogItemsSubject.value;
        this.catalogItemsSubject.next([...currentItems, newItem]);
      }),
    );
  }

  /**
   * PUT /api/v1/catalog/{id}
   * Actualizar un item
   */
  update(id: string, dto: UpdateCatalogItemDto): Observable<CatalogItem> {
    return this.http.put<CatalogItem>(`${this.baseUrl}/${id}`, dto).pipe(
      tap((updatedItem) => {
        const currentItems = this.catalogItemsSubject.value;
        const index = currentItems.findIndex((i) => i.id === id);
        if (index !== -1) {
          currentItems[index] = updatedItem;
          this.catalogItemsSubject.next([...currentItems]);
        }
      }),
    );
  }

  /**
   * DELETE /api/v1/catalog/{id}
   * Eliminar un item (soft delete)
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        const currentItems = this.catalogItemsSubject.value;
        this.catalogItemsSubject.next(currentItems.filter((i) => i.id !== id));
      }),
    );
  }

  /**
   * PUT /api/v1/catalog/{id}/stock
   * Actualizar stock de un item
   */
  updateStock(id: string, dto: UpdateStockDto): Observable<CatalogItem> {
    return this.http.put<CatalogItem>(`${this.baseUrl}/${id}/stock`, dto);
  }

  /**
   * POST /api/v1/catalog/sync/{externalSystem}
   * Sincronizar catálogo con sistema externo
   */
  syncWithExternal(externalSystem: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/sync/${externalSystem}`, {});
  }
}
