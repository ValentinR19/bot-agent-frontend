import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface HttpOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
}

@Injectable({ providedIn: 'root' })
export class HttpService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  private buildHeaders(custom?: Record<string, string>): HttpHeaders {
    let headers = new HttpHeaders();

    // custom headers
    if (custom) {
      for (const [key, value] of Object.entries(custom)) {
        headers = headers.set(key, value);
      }
    }

    // auth
    const token = localStorage.getItem('access_token');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  private buildParams(params?: Record<string, string | number | boolean>): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        httpParams = httpParams.set(key, String(value));
      }
    }

    return httpParams;
  }

  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) return endpoint;

    const base = this.baseUrl.replace(/\/+$/, '');
    const clean = endpoint.replace(/^\/+/, '');

    return `${base}/${clean}`;
  }

  get<T>(endpoint: string, options?: HttpOptions): Observable<T> {
    return this.http.get<T>(this.buildUrl(endpoint), {
      headers: this.buildHeaders(options?.headers),
      params: this.buildParams(options?.params),
    });
  }

  post<T>(endpoint: string, body: any, options?: HttpOptions): Observable<T> {
    return this.http.post<T>(this.buildUrl(endpoint), body, {
      headers: this.buildHeaders(options?.headers),
      params: this.buildParams(options?.params),
    });
  }

  put<T>(endpoint: string, body: any, options?: HttpOptions): Observable<T> {
    return this.http.put<T>(this.buildUrl(endpoint), body, {
      headers: this.buildHeaders(options?.headers),
      params: this.buildParams(options?.params),
    });
  }

  patch<T>(endpoint: string, body: any, options?: HttpOptions): Observable<T> {
    return this.http.patch<T>(this.buildUrl(endpoint), body, {
      headers: this.buildHeaders(options?.headers),
      params: this.buildParams(options?.params),
    });
  }

  delete<T>(endpoint: string, options?: HttpOptions): Observable<T> {
    return this.http.delete<T>(this.buildUrl(endpoint), {
      headers: this.buildHeaders(options?.headers),
      params: this.buildParams(options?.params),
    });
  }

  // special types
  getBlob(endpoint: string): Observable<Blob> {
    return this.http.get(this.buildUrl(endpoint), { responseType: 'blob' });
  }

  getBuffer(endpoint: string): Observable<ArrayBuffer> {
    return this.http.get(this.buildUrl(endpoint), {
      responseType: 'arraybuffer',
    });
  }
}
