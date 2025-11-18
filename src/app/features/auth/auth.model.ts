/**
 * Modelos y DTOs para el feature Auth
 * Generados a partir de swagger-export.json
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  avatarUrl?: string;
  tenantId: string;
  isSuperAdmin?: boolean; // Para identificar si puede cambiar de tenant
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
