import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpService } from '../../../core/http/http.service';
import { CreateTenantDto, Tenant, UpdateTenantDto } from '../models/tenant.model';

/**
 * Servicio para gestión de Tenants
 * Endpoints generados desde swagger-export.json
 */
@Injectable({
  providedIn: 'root',
})
export class TenantsService {
  private readonly http = inject(HttpService);
  private readonly baseUrl = '/tenants';

  // Estado interno (mini-store)
  private tenantsSubject = new BehaviorSubject<Tenant[]>([]);
  public tenants$ = this.tenantsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  /**
   * GET /api/v1/tenants
   * Listar todos los tenants
   */
  findAll(): Observable<Tenant[]> {
    this.loadingSubject.next(true);

    return this.http.get<Tenant[]>(this.baseUrl).pipe(
      tap({
        next: (tenants) => {
          this.tenantsSubject.next(tenants);
          this.loadingSubject.next(false);
        },
        error: () => {
          this.loadingSubject.next(false);
        },
      }),
    );
  }

  /**
   * GET /api/v1/tenants/{id}
   * Obtener un tenant por ID
   */
  findOne(id: string): Observable<Tenant> {
    return this.http.get<Tenant>(`${this.baseUrl}/${id}`);
  }

  /**
   * GET /api/v1/tenants/slug/{slug}
   * Obtener un tenant por slug
   */
  findBySlug(slug: string): Observable<Tenant> {
    return this.http.get<Tenant>(`${this.baseUrl}/slug/${slug}`);
  }

  /**
   * POST /api/v1/tenants
   * Crear un nuevo tenant
   */
  create(dto: CreateTenantDto): Observable<Tenant> {
    return this.http.post<Tenant>(this.baseUrl, dto).pipe(
      tap((newTenant) => {
        const currentTenants = this.tenantsSubject.value;
        this.tenantsSubject.next([...currentTenants, newTenant]);
      }),
    );
  }

  /**
   * PUT /api/v1/tenants/{id}
   * Actualizar un tenant
   */
  update(id: string, dto: UpdateTenantDto): Observable<Tenant> {
    return this.http.put<Tenant>(`${this.baseUrl}/${id}`, dto).pipe(
      tap((updatedTenant) => {
        const currentTenants = this.tenantsSubject.value;
        const index = currentTenants.findIndex((t) => t.id === id);
        if (index !== -1) {
          currentTenants[index] = updatedTenant;
          this.tenantsSubject.next([...currentTenants]);
        }
      }),
    );
  }

  /**
   * DELETE /api/v1/tenants/{id}
   * Eliminar un tenant (soft delete)
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        const currentTenants = this.tenantsSubject.value;
        this.tenantsSubject.next(currentTenants.filter((t) => t.id !== id));
      }),
    );
  }
}
