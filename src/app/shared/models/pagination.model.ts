/**
 * Modelos de paginación para respuestas del backend
 *
 * El backend devuelve respuestas paginadas con este formato:
 * {
 *   data: T[],
 *   meta: PaginationMeta
 * }
 */

/**
 * Metadata de paginación
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Respuesta paginada genérica
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * DTO para parámetros de paginación en requests
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
