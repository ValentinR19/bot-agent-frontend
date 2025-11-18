import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface HttpOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | string[] };
  observe?: 'body' | 'response';
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
}

/**
 * Servicio HTTP centralizado que encapsula HttpClient
 * Agrega automáticamente headers necesarios (Authorization)
 *
 * NOTA: El header X-Tenant-Id se agrega automáticamente vía TenantInterceptor
 * NO se debe agregar manualmente aquí
 *
 * Maneja la construcción de URLs con el baseURL del environment
 */
@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /**
   * Construye headers con Authorization
   * X-Tenant-Id se agrega automáticamente vía interceptor
   */
  private buildHeaders(customHeaders?: HttpHeaders | { [header: string]: string | string[] }): HttpHeaders {
    let headers = new HttpHeaders(customHeaders || {});

    // Agregar Authorization si existe JWT en localStorage
    const token = localStorage.getItem('access_token');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * Construye la URL completa
   */
  private buildUrl(endpoint: string): string {
    // Si el endpoint ya contiene http:// o https://, usarlo directamente
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }

    // Eliminar "/" inicial del endpoint si existe
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;

    // Asegurar que baseUrl NO termina con "/"
    const cleanBaseUrl = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;

    return `${cleanBaseUrl}/${cleanEndpoint}`;
  }

  /**
   * GET request tipado
   */
  get<T>(endpoint: string, options?: HttpOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const headers = this.buildHeaders(options?.headers);

    return this.http.get<T>(url, {
      ...options,
      headers
    });
  }

  /**
   * POST request tipado
   */
  post<T>(endpoint: string, body: any, options?: HttpOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const headers = this.buildHeaders(options?.headers);

    return this.http.post<T>(url, body, {
      ...options,
      headers
    });
  }

  /**
   * PUT request tipado
   */
  put<T>(endpoint: string, body: any, options?: HttpOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const headers = this.buildHeaders(options?.headers);

    return this.http.put<T>(url, body, {
      ...options,
      headers
    });
  }

  /**
   * PATCH request tipado
   */
  patch<T>(endpoint: string, body: any, options?: HttpOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const headers = this.buildHeaders(options?.headers);

    return this.http.patch<T>(url, body, {
      ...options,
      headers
    });
  }

  /**
   * DELETE request tipado
   */
  delete<T>(endpoint: string, options?: HttpOptions): Observable<T> {
    const url = this.buildUrl(endpoint);
    const headers = this.buildHeaders(options?.headers);

    return this.http.delete<T>(url, {
      ...options,
      headers
    });
  }
}
