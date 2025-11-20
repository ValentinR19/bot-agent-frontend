import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { PanelMenuModule } from 'primeng/panelmenu';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MenuModule, PanelMenuModule],
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
      label: 'Conocimiento',
      icon: 'pi pi-book',
      items: [
        {
          label: 'Base de Conocimiento',
          icon: 'pi pi-database',
          routerLink: ['/knowledge'],
        },
        {
          label: 'RAG Playground',
          icon: 'pi pi-sparkles',
          routerLink: ['/knowledge/playground'],
        },
        {
          label: 'Catálogo',
          icon: 'pi pi-shopping-cart',
          routerLink: ['/catalog'],
        },
      ],
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
