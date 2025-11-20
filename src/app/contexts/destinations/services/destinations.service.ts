import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Destination, CreateDestinationDto, UpdateDestinationDto, TestDestinationDto, DestinationType } from '../models/destinations.model';
import { PaginatedResponse } from '../../../shared/models/pagination.model';

/**
 * Servicio para gestionar destinos (integraciones externas)
 * Endpoints: /api/v1/destinations
 * Requiere header X-Tenant-Id (manejado por interceptor)
 */
@Injectable({
  providedIn: 'root',
})
export class DestinationsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/destinations`;

  /**
   * Listar todos los destinos
   * GET /api/v1/destinations
   */
  getDestinations(): Observable<PaginatedResponse<Destination>> {
    return this.http.get<PaginatedResponse<Destination>>(this.apiUrl);
  }

  /**
   * Listar destinos activos
   * GET /api/v1/destinations/active
   */
  getActiveDestinations(): Observable<PaginatedResponse<Destination>> {
    return this.http.get<PaginatedResponse<Destination>>(`${this.apiUrl}/active`);
  }

  /**
   * Listar destinos por tipo
   * GET /api/v1/destinations/type/{type}
   */
  getDestinationsByType(type: DestinationType): Observable<PaginatedResponse<Destination>> {
    return this.http.get<PaginatedResponse<Destination>>(`${this.apiUrl}/type/${type}`);
  }

  /**
   * Obtener un destino por ID
   * GET /api/v1/destinations/{id}
   */
  getDestinationById(id: string): Observable<Destination> {
    return this.http.get<Destination>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear un nuevo destino
   * POST /api/v1/destinations
   */
  createDestination(dto: CreateDestinationDto): Observable<Destination> {
    return this.http.post<Destination>(this.apiUrl, dto);
  }

  /**
   * Actualizar un destino
   * PUT /api/v1/destinations/{id}
   */
  updateDestination(id: string, dto: UpdateDestinationDto): Observable<Destination> {
    return this.http.put<Destination>(`${this.apiUrl}/${id}`, dto);
  }

  /**
   * Eliminar un destino (soft delete)
   * DELETE /api/v1/destinations/{id}
   */
  deleteDestination(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Probar conexión con un destino
   * POST /api/v1/destinations/{id}/test
   */
  testDestination(id: string, dto: TestDestinationDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/test`, dto);
  }

  /**
   * Resetear estadísticas de un destino
   * POST /api/v1/destinations/{id}/reset-stats
   */
  resetDestinationStats(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/reset-stats`, {});
  }
}
