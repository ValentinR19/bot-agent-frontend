import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TenantService } from '../../../core/services/tenant.service';
import { AuthService } from '../../../contexts/auth/services/auth.service';
import { AuthUser, AuthUserTenant } from '../../../contexts/auth/models/auth.model';

/**
 * Componente para seleccionar un tenant cuando el usuario no tiene uno activo
 *
 * CASOS DE USO:
 * - Usuario intenta acceder a una ruta tenant-scoped sin tenant activo
 * - Usuario tiene múltiples tenants y quiere cambiar
 * - Superadmin sin tenant asignado necesita seleccionar uno para operar
 */
@Component({
  selector: 'app-select-tenant',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule],
  templateUrl: './select-tenant.component.html',
  styleUrl: './select-tenant.component.scss',
})
export class SelectTenantComponent implements OnInit, OnDestroy {
  private readonly tenantService = inject(TenantService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  currentUser: AuthUser | null = null;
  userTenants: AuthUserTenant[] = [];

  ngOnInit(): void {
    // Obtener usuario actual
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.currentUser = user;
    });

    // Obtener lista de tenants del usuario
    this.tenantService.userTenants$.pipe(takeUntil(this.destroy$)).subscribe((tenants) => {
      this.userTenants = tenants;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectTenant(tenant: AuthUserTenant): void {
    this.tenantService.setActiveTenant(tenant.id);
    // Redirigir al dashboard o a la página que intentaba acceder
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.authService.clearAuthData();
    this.router.navigate(['/auth/login']);
  }

  get hasNoTenants(): boolean {
    return this.userTenants.length === 0;
  }

  get userName(): string {
    return this.currentUser?.fullName || this.currentUser?.email || 'Usuario';
  }
}
