import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  timestamp?: string;
  path?: string;
}

/**
 * Servicio para normalizar errores HTTP
 */
@Injectable({
  providedIn: 'root',
})
export class HttpErrorHandler {
  /**
   * Normaliza errores HTTP a un formato consistente
   */
  handleError(error: HttpErrorResponse): Observable<never> {
    let apiError: ApiError;

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      apiError = {
        message: error.error.message || 'Error de red',
        statusCode: 0,
        error: 'CLIENT_ERROR',
      };
    } else {
      // Error del lado del servidor
      apiError = {
        message: error.error?.message || error.message || 'Error del servidor',
        statusCode: error.status,
        error: error.error?.error || error.statusText,
        timestamp: error.error?.timestamp,
        path: error.error?.path || error.url || undefined,
      };
    }

    console.error('HTTP Error:', apiError);

    return throwError(() => apiError);
  }

  /**
   * Obtiene un mensaje de error legible para el usuario
   */
  getUserFriendlyMessage(error: ApiError): string {
    switch (error.statusCode) {
      case 0:
        return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      case 400:
        return error.message || 'Los datos enviados son inválidos.';
      case 401:
        return 'No estás autenticado. Por favor inicia sesión.';
      case 403:
        return 'No tienes permisos para realizar esta acción.';
      case 404:
        return 'El recurso solicitado no fue encontrado.';
      case 409:
        return error.message || 'El recurso ya existe.';
      case 422:
        return error.message || 'Los datos no pudieron ser procesados.';
      case 500:
        return 'Error interno del servidor. Por favor intenta más tarde.';
      case 503:
        return 'El servicio no está disponible temporalmente.';
      default:
        return error.message || 'Ocurrió un error inesperado.';
    }
  }
}
