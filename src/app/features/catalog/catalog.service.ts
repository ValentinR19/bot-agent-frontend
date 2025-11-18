import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpService } from '../../core/http/http.service';
import {
  CatalogItem,
  CreateCatalogItemDto,
  UpdateCatalogItemDto,
  CatalogItemResponseDto,
  CatalogItemType,
  CatalogSearchDto,
  UpdateStockDto
} from './catalog.model';

/**
 * Servicio para gestión de Catalog (productos/servicios)
 * Endpoints generados desde swagger-export.json
 */
@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private readonly http = inject(HttpService);
  private readonly baseUrl = '/api/v1/catalog';

  // Estado interno (mini-store)
  private catalogItemsSubject = new BehaviorSubject<CatalogItem[]>([]);
  public catalogItems$ = this.catalogItemsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  /**
   * GET /api/v1/catalog
   * Listar todos los items del catálogo
   */
  findAll(): Observable<CatalogItemResponseDto[]> {
    this.loadingSubject.next(true);

    return this.http.get<CatalogItemResponseDto[]>(this.baseUrl).pipe(
      tap({
        next: (items) => {
          this.catalogItemsSubject.next(items);
          this.loadingSubject.next(false);
        },
        error: () => {
          this.loadingSubject.next(false);
        }
      })
    );
  }

  /**
   * POST /api/v1/catalog/search
   * Buscar items del catálogo
   */
  search(dto: CatalogSearchDto): Observable<CatalogItemResponseDto[]> {
    return this.http.post<CatalogItemResponseDto[]>(`${this.baseUrl}/search`, dto);
  }

  /**
   * GET /api/v1/catalog/featured
   * Obtener items destacados
   */
  findFeatured(): Observable<CatalogItemResponseDto[]> {
    return this.http.get<CatalogItemResponseDto[]>(`${this.baseUrl}/featured`);
  }

  /**
   * GET /api/v1/catalog/type/{type}
   * Listar items por tipo
   */
  findByType(type: CatalogItemType): Observable<CatalogItemResponseDto[]> {
    return this.http.get<CatalogItemResponseDto[]>(`${this.baseUrl}/type/${type}`);
  }

  /**
   * GET /api/v1/catalog/sku/{sku}
   * Obtener item por SKU
   */
  findBySku(sku: string): Observable<CatalogItemResponseDto> {
    return this.http.get<CatalogItemResponseDto>(`${this.baseUrl}/sku/${sku}`);
  }

  /**
   * GET /api/v1/catalog/{id}
   * Obtener un item por ID
   */
  findOne(id: string): Observable<CatalogItemResponseDto> {
    return this.http.get<CatalogItemResponseDto>(`${this.baseUrl}/${id}`);
  }

  /**
   * POST /api/v1/catalog
   * Crear un nuevo item
   */
  create(dto: CreateCatalogItemDto): Observable<CatalogItemResponseDto> {
    return this.http.post<CatalogItemResponseDto>(this.baseUrl, dto).pipe(
      tap((newItem) => {
        const currentItems = this.catalogItemsSubject.value;
        this.catalogItemsSubject.next([...currentItems, newItem]);
      })
    );
  }

  /**
   * PUT /api/v1/catalog/{id}
   * Actualizar un item
   */
  update(id: string, dto: UpdateCatalogItemDto): Observable<CatalogItemResponseDto> {
    return this.http.put<CatalogItemResponseDto>(`${this.baseUrl}/${id}`, dto).pipe(
      tap((updatedItem) => {
        const currentItems = this.catalogItemsSubject.value;
        const index = currentItems.findIndex(i => i.id === id);
        if (index !== -1) {
          currentItems[index] = updatedItem;
          this.catalogItemsSubject.next([...currentItems]);
        }
      })
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
        this.catalogItemsSubject.next(currentItems.filter(i => i.id !== id));
      })
    );
  }

  /**
   * PUT /api/v1/catalog/{id}/stock
   * Actualizar stock de un item
   */
  updateStock(id: string, dto: UpdateStockDto): Observable<CatalogItemResponseDto> {
    return this.http.put<CatalogItemResponseDto>(`${this.baseUrl}/${id}/stock`, dto);
  }

  /**
   * POST /api/v1/catalog/sync/{externalSystem}
   * Sincronizar catálogo con sistema externo
   */
  syncWithExternal(externalSystem: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/sync/${externalSystem}`, {});
  }
}
