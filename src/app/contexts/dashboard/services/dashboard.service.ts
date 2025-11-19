import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DashboardData, DashboardStats } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor() {}

  /**
   * Obtiene los datos del dashboard
   * @returns Observable con los datos del dashboard
   */
  getDashboardData(): Observable<DashboardData> {
    // Aquí iría la llamada a un API real
    // Por ahora retorna datos de ejemplo
    return of(this.getMockDashboardData());
  }

  /**
   * Obtiene las estadísticas del dashboard
   * @returns Observable con las estadísticas
   */
  getDashboardStats(): Observable<DashboardStats> {
    const data = this.getMockDashboardData();
    return of(data.stats);
  }

  /**
   * Datos de ejemplo del dashboard
   * @private
   */
  private getMockDashboardData(): DashboardData {
    return {
      stats: {
        totalConversations: 12547,
        activeChannels: 8,
        totalFlows: 15,
        documentsProcessed: 1289,
      },
      conversationsData: {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'],
        datasets: [
          {
            label: 'Conversaciones',
            data: [650, 590, 800, 810, 760, 950],
            fill: true,
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: '#3b82f6',
            tension: 0.4,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            borderRadius: 8,
            titleFont: {
              size: 14,
              weight: 'bold',
            },
            bodyFont: {
              size: 13,
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: {
                size: 12,
              },
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
            ticks: {
              font: {
                size: 12,
              },
            },
          },
        },
      },
    };
  }
}
