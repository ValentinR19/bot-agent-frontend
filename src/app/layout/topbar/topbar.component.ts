import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, ButtonModule, MenuModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  userMenuItems: MenuItem[] = [
    {
      label: 'Perfil',
      icon: 'pi pi-user',
      command: () => this.goToProfile()
    },
    {
      label: 'Configuración',
      icon: 'pi pi-cog',
      command: () => this.goToSettings()
    },
    {
      separator: true
    },
    {
      label: 'Cerrar Sesión',
      icon: 'pi pi-sign-out',
      command: () => this.logout()
    }
  ];

  constructor(private router: Router) {}

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
    localStorage.removeItem('access_token');
    this.router.navigate(['/auth/login']);
  }

  get userName(): string {
    // TODO: Obtener nombre de usuario del servicio de autenticación
    return 'Usuario';
  }

  get userEmail(): string {
    // TODO: Obtener email del servicio de autenticación
    return 'usuario@ejemplo.com';
  }
}
