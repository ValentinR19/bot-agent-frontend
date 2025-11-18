import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MenuModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @Input() visible = true;

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      routerLink: ['/dashboard'],
    },
    {
      separator: true,
    },
    {
      label: 'Configuración',
      icon: 'pi pi-cog',
      items: [
        {
          label: 'Tenants',
          icon: 'pi pi-building',
          routerLink: ['/tenants'],
        },
        {
          label: 'Usuarios',
          icon: 'pi pi-users',
          routerLink: ['/users'],
        },
        {
          label: 'Equipos',
          icon: 'pi pi-sitemap',
          routerLink: ['/teams'],
        },
        {
          label: 'Roles',
          icon: 'pi pi-shield',
          routerLink: ['/roles'],
        },
      ],
    },
    {
      separator: true,
    },
    {
      label: 'Canales',
      icon: 'pi pi-comment',
      items: [
        {
          label: 'Gestión de Canales',
          icon: 'pi pi-slack',
          routerLink: ['/channels'],
        },
        {
          label: 'Conversaciones',
          icon: 'pi pi-comments',
          routerLink: ['/conversations'],
        },
      ],
    },
    {
      separator: true,
    },
    {
      label: 'Flujos',
      icon: 'pi pi-sitemap',
      items: [
        {
          label: 'Gestión de Flujos',
          icon: 'pi pi-share-alt',
          routerLink: ['/flows'],
        },
      ],
    },
    {
      separator: true,
    },
    {
      label: 'Conocimiento',
      icon: 'pi pi-book',
      items: [
        {
          label: 'Base de Conocimiento',
          icon: 'pi pi-database',
          routerLink: ['/knowledge'],
        },
        {
          label: 'Catálogo',
          icon: 'pi pi-shopping-cart',
          routerLink: ['/catalog'],
        },
      ],
    },
    {
      separator: true,
    },
    {
      label: 'Análisis',
      icon: 'pi pi-chart-bar',
      items: [
        {
          label: 'Uso de LLM',
          icon: 'pi pi-dollar',
          routerLink: ['/llm-usage'],
        },
      ],
    },
  ];
}
