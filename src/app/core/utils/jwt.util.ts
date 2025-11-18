/**
 * Utilidades para manejo de JWT
 */

export interface JwtPayload {
  sub: string;
  email: string;
  tenantId?: string;
  roles?: string[];
  iat: number;
  exp: number;
}

export class JwtUtil {
  /**
   * Decodifica un JWT sin validar la firma
   */
  static decode(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = parts[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  /**
   * Verifica si el token está expirado
   */
  static isExpired(token: string): boolean {
    const payload = this.decode(token);
    if (!payload) {
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  }

  /**
   * Obtiene el userId del token
   */
  static getUserId(token: string): string | null {
    const payload = this.decode(token);
    return payload?.sub || null;
  }

  /**
   * Obtiene el tenantId del token
   */
  static getTenantId(token: string): string | null {
    const payload = this.decode(token);
    return payload?.tenantId || null;
  }
}
