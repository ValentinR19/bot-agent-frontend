import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { HttpService } from '../../../core/http/http.service';
import { TenantService } from '../../../core/services/tenant.service';
import {
  ApiLoginResponse,
  AuthUser,
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginCredentials,
  LoginResponse,
  RefreshTokenDto,
  RefreshTokenResponse,
  RegisterDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from '../models/auth.model';

/**
 * Servicio para autenticación y gestión de usuarios
 * Endpoints generados desde swagger-export.json
 *
 * IMPORTANTE: Al hacer login, guarda el tenantId del usuario
 * en el TenantService para que el interceptor lo use
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpService);
  private readonly router = inject(Router);
  private readonly tenantService = inject(TenantService);
  private readonly baseUrl = '/auth';

  // Estado interno
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    // Verificar si hay un usuario almacenado en localStorage
    this.loadUserFromStorage();
  }

  /**
   * POST /api/v1/auth/login
   * Iniciar sesión
   */
  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<ApiLoginResponse>(`${this.baseUrl}/login`, credentials).pipe(
      map((response) => response.data),
      tap((data) => {
        this.setAuthData(data);
      }),
    );
  }

  /**
   * POST /api/v1/auth/register
   * Registrar nuevo usuario
   */
  register(dto: RegisterDto): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/register`, dto).pipe(
      tap((response) => {
        this.setAuthData(response);
      }),
    );
  }

  /**
   * POST /api/v1/auth/logout
   * Cerrar sesión
   */
  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/logout`, {}).pipe(
      tap(() => {
        this.clearAuthData();
      }),
    );
  }

  /**
   * POST /api/v1/auth/refresh
   * Refrescar token de acceso
   */
  refreshToken(dto: RefreshTokenDto): Observable<RefreshTokenResponse> {
    return this.http.post<RefreshTokenResponse>(`${this.baseUrl}/refresh`, dto).pipe(
      tap((response) => {
        this.updateTokens(response);
      }),
    );
  }

  /**
   * POST /api/v1/auth/change-password
   * Cambiar contraseña
   */
  changePassword(dto: ChangePasswordDto): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/change-password`, dto);
  }

  /**
   * POST /api/v1/auth/forgot-password
   * Solicitar restablecimiento de contraseña
   */
  forgotPassword(dto: ForgotPasswordDto): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/forgot-password`, dto);
  }

  /**
   * POST /api/v1/auth/reset-password
   * Restablecer contraseña
   */
  resetPassword(dto: ResetPasswordDto): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/reset-password`, dto);
  }

  /**
   * POST /api/v1/auth/verify-email
   * Verificar email
   */
  verifyEmail(dto: VerifyEmailDto): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/verify-email`, dto);
  }

  /**
   * GET /api/v1/auth/me
   * Obtener usuario actual
   */
  getCurrentUser(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.baseUrl}/me`).pipe(
      tap((user) => {
        this.currentUserSubject.next(user);
      }),
    );
  }

  // Métodos auxiliares para gestión de tokens
  private setAuthData(response: LoginResponse): void {
    localStorage.setItem('access_token', response.accessToken);
    if (response.refreshToken) {
      localStorage.setItem('refresh_token', response.refreshToken);
    }
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('tenants', JSON.stringify(response.tenants || []));

    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);

    // MULTI-TENANT: Inicializar TenantService con lista de tenants del usuario
    // Esto seleccionará automáticamente el tenant por defecto o el primero disponible
    this.tenantService.initFromAuth(response.tenants || [], response.user.defaultTenantId);
  }

  private updateTokens(response: RefreshTokenResponse): void {
    localStorage.setItem('access_token', response.accessToken);
    localStorage.setItem('refresh_token', response.refreshToken);
  }

  clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('tenants');
    this.tenantService.clearCurrentTenantId();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  private loadUserFromStorage(): void {
    const userJson = localStorage.getItem('user');
    const tenantsJson = localStorage.getItem('tenants');
    const token = localStorage.getItem('access_token');

    if (userJson && token) {
      try {
        const user = JSON.parse(userJson);
        const tenants = tenantsJson ? JSON.parse(tenantsJson) : [];

        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);

        // MULTI-TENANT: Restaurar contexto de tenants en TenantService
        this.tenantService.initFromAuth(tenants, user.defaultTenantId);
      } catch (error) {
        this.clearAuthData();
      }
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}
