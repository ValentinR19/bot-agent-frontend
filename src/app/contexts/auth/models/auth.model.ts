/**
 * Modelos y DTOs para el contexto Auth
 * Actualizados para coincidir con la respuesta real del backend
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
 * Datos de login dentro de data
 */
export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
  refreshToken?: string; // Opcional, el backend actual no lo devuelve
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  tenantId: string | null;
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
