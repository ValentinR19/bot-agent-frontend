import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, OnDestroy, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { SelectModule } from 'primeng/select';
import { TenantService } from '../../core/services/tenant.service';
import { AuthUser, AuthUserTenant } from '../../contexts/auth/models/auth.model';
import { AuthService } from '../../contexts/auth/services/auth.service';

/**
 * Topbar con selector de tenant multi-tenant
 *
 * MULTI-TENANT:
 * - Muestra lista de tenants asignados al usuario (NO todos los tenants del sistema)
 * - Permite cambiar el tenant activo
 * - Visible para todos los usuarios (no solo superadmins)
 * - Si el usuario tiene 1 solo tenant, se puede ocultar el selector
 */
@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, MenuModule, SelectModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent implements OnInit, OnDestroy {
  @Output() toggleSidebar = new EventEmitter<void>();

  private readonly authService = inject(AuthService);
  private readonly tenantService = inject(TenantService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  currentUser: AuthUser | null = null;
  userTenants: AuthUserTenant[] = [];
  selectedTenantId: string | null = null;

  userMenuItems: MenuItem[] = [
    {
      label: 'Perfil',
      icon: 'pi pi-user',
      command: () => this.goToProfile(),
    },
    {
      label: 'Configuración',
      icon: 'pi pi-cog',
      command: () => this.goToSettings(),
    },
    {
      separator: true,
    },
    {
      label: 'Cerrar Sesión',
      icon: 'pi pi-sign-out',
      command: () => this.logout(),
    },
  ];

  ngOnInit(): void {
    // Suscribirse al usuario actual
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      this.currentUser = user;
    });

    // Suscribirse a la lista de tenants del usuario
    this.tenantService.userTenants$.pipe(takeUntil(this.destroy$)).subscribe((tenants) => {
      this.userTenants = tenants;
    });

    // Suscribirse al tenant activo
    this.tenantService.currentTenantId$.pipe(takeUntil(this.destroy$)).subscribe((tenantId) => {
      this.selectedTenantId = tenantId;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTenantChange(event: any): void {
    const newTenantId = event.value;

    if (newTenantId) {
      // Cambiar el tenant activo
      this.tenantService.setActiveTenant(newTenantId);

      // Recargar la página para refrescar datos con el nuevo tenant
      window.location.reload();
    }
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  goToSettings(): void {
    this.router.navigate(['/settings']);
  }

  logout(): void {
    this.authService.clearAuthData();
    this.router.navigate(['/auth/login']);
  }

  get userName(): string {
    return this.currentUser?.fullName || this.currentUser?.email || 'Usuario';
  }

  get userEmail(): string {
    return this.currentUser?.email || 'usuario@ejemplo.com';
  }

  get isSuperAdmin(): boolean {
    return this.currentUser?.isSuperAdmin || false;
  }

  get currentTenantName(): string {
    if (!this.selectedTenantId) return 'Sin tenant';

    const tenant = this.userTenants.find((t) => t.id === this.selectedTenantId);
    return tenant?.name || 'Tenant';
  }

  /**
   * Muestra el selector de tenant si:
   * - El usuario tiene más de 1 tenant, O
   * - Es superadmin (puede tener 0 tenants pero necesita seleccionar uno)
   */
  get showTenantSelector(): boolean {
    return this.userTenants.length > 1 || this.isSuperAdmin;
  }
}
