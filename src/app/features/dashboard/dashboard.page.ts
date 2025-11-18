import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, ChartModule, PageHeaderComponent],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss'
})
export class DashboardPage {
  // Datos de ejemplo para el dashboard
  conversationsData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Conversaciones',
        data: [65, 59, 80, 81, 56, 55],
        fill: false,
        borderColor: '#42A5F5',
        tension: 0.4
      }
    ]
  };

  stats = {
    totalConversations: 1234,
    activeChannels: 5,
    totalFlows: 12,
    documentsProcessed: 89
  };
}
