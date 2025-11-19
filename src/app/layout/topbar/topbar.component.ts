import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';

import { SelectModule } from 'primeng/select';
import { TenantService } from '../../core/services/tenant.service';
import { AuthUser } from '../../contexts/auth/models/auth.model';
import { AuthService } from '../../contexts/auth/services/auth.service';
import { Tenant } from '../../contexts/tenants/models/tenant.model';
import { TenantsService } from '../../contexts/tenants/services/tenants.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, MenuModule, SelectModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();

  private readonly authService = inject(AuthService);
  private readonly tenantsService = inject(TenantsService);
  private readonly tenantService = inject(TenantService);
  private readonly router = inject(Router);

  currentUser: AuthUser | null = null;
  availableTenants: Tenant[] = [];
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
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;

      // Si es super admin, cargar lista de tenants
      if (user?.isSuperAdmin) {
        this.loadTenants();
      }
    });

    // Suscribirse al tenant actual
    this.tenantService.currentTenantId$.subscribe((tenantId) => {
      this.selectedTenantId = tenantId;
    });
  }

  loadTenants(): void {
    this.tenantsService.findAll().subscribe({
      next: (tenants) => {
        this.availableTenants = tenants;
      },
      error: (error) => {
        console.error('Error loading tenants:', error);
      },
    });
  }

  onTenantChange(event: any): void {
    const newTenantId = event.value;

    if (newTenantId) {
      // Cambiar el tenant actual
      this.tenantService.setCurrentTenantId(newTenantId);

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

    const tenant = this.availableTenants.find((t) => t.id === this.selectedTenantId);
    return tenant?.name || 'Tenant';
  }
}
