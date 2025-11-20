/**
 * Modelos y DTOs para el contexto Auth
 * Actualizados para multi-tenant: un usuario puede tener N tenants
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Respuesta del backend envuelta en data
 */
export interface ApiLoginResponse {
  data: LoginResponse;
  timestamp: string;
  path: string;
}

/**
 * Tenant asignado al usuario con su rol
 */
export interface AuthUserTenant {
  id: string;
  name: string;
  role: string;
}

/**
 * Datos de login dentro de data
 * MULTI-TENANT: ahora incluye lista de tenants del usuario
 */
export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
  tenants: AuthUserTenant[]; // Lista de tenants del usuario
  refreshToken?: string; // Opcional
}

/**
 * Usuario autenticado
 * MULTI-TENANT: ya no tiene un solo tenantId, sino defaultTenantId
 */
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  defaultTenantId?: string | null; // Tenant por defecto (opcional)
  isSuperAdmin?: boolean;
  isActive: boolean;
  avatarUrl?: string;
  roles?: string[];
  permissions?: string[];
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tenantId: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export interface VerifyEmailDto {
  token: string;
}

/**
 * Tipos para el formulario de login
 */
export interface LoginFormModel {
  email: string;
  password: string;
}
