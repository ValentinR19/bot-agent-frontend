/**
 * Ingestion Progress Component
 * Muestra el progreso de ingestión de un documento con estados y timer
 */

import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { IngestionStatus } from '../../models/knowledge-document.model';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { BadgeModule } from 'primeng/badge';
import { ChipModule } from 'primeng/chip';

@Component({
  selector: 'app-ingestion-progress',
  standalone: true,
  imports: [CommonModule, CardModule, ProgressBarModule, BadgeModule, ChipModule],
  template: `
    <p-card [header]="getStatusTitle()">
      <div class="progress-container">
        <!-- Status badge -->
        <div class="flex justify-content-between align-items-center mb-3">
          <p-badge [value]="getStatusLabel(status)" [severity]="getStatusSeverity(status)"></p-badge>
          <span class="text-gray-500 text-sm" *ngIf="status === 'processing'">Tiempo transcurrido: {{ elapsedTime }}</span>
        </div>

        <!-- Progress bar -->
        <p-progressBar [value]="progress" [showValue]="true" [style]="{ height: '1.5rem' }"></p-progressBar>

        <!-- Status message -->
        <div class="status-message mt-3">
          <div [ngSwitch]="status">
            <div *ngSwitchCase="'pending'" class="flex align-items-center gap-2 text-blue-600">
              <i class="pi pi-clock"></i>
              <span>El documento está en cola para ser procesado</span>
            </div>

            <div *ngSwitchCase="'processing'" class="flex align-items-center gap-2 text-orange-600">
              <i class="pi pi-spin pi-spinner"></i>
              <span>{{ getProcessingMessage() }}</span>
            </div>

            <div *ngSwitchCase="'completed'" class="flex align-items-center gap-2 text-green-600">
              <i class="pi pi-check-circle"></i>
              <span>Ingestión completada exitosamente. {{ chunkCount }} chunks generados.</span>
            </div>

            <div *ngSwitchCase="'failed'" class="flex align-items-center gap-2 text-red-600">
              <i class="pi pi-times-circle"></i>
              <span>{{ errorMessage || 'La ingestión falló. Por favor, reintenta.' }}</span>
            </div>
          </div>
        </div>

        <!-- Chunk count badge -->
        <div class="mt-3 flex justify-content-between align-items-center" *ngIf="chunkCount > 0">
          <span class="text-sm font-semibold text-gray-700">Chunks procesados:</span>
          <p-chip [label]="chunkCount + ' chunks'" styleClass="custom-chip"></p-chip>
        </div>
      </div>
    </p-card>
  `,
  styles: [
    `
      .progress-container {
        padding: 0.5rem 0;
      }

      .status-message {
        font-size: 0.875rem;
        padding: 0.75rem;
        background: #f8f9fa;
        border-radius: 6px;
      }

      ::ng-deep .custom-chip {
        background: #3b82f6;
        color: white;
      }

      ::ng-deep .p-progressbar {
        border-radius: 8px;
      }

      ::ng-deep .p-progressbar .p-progressbar-value {
        border-radius: 8px;
      }
    `,
  ],
})
export class IngestionProgressComponent implements OnInit, OnDestroy {
  @Input() status: IngestionStatus = IngestionStatus.PENDING;
  @Input() progress = 0;
  @Input() chunkCount = 0;
  @Input() errorMessage?: string;

  elapsedTime = '00:00';
  private startTime?: number;
  private timerSubscription?: Subscription;

  ngOnInit(): void {
    if (this.status === IngestionStatus.PROCESSING) {
      this.startTimer();
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  ngOnChanges(): void {
    if (this.status === IngestionStatus.PROCESSING && !this.timerSubscription) {
      this.startTimer();
    } else if (this.status !== IngestionStatus.PROCESSING) {
      this.stopTimer();
    }
  }

  getStatusTitle(): string {
    const titles: Record<string, string> = {
      pending: 'Esperando procesamiento',
      processing: 'Procesando documento',
      completed: 'Ingestión completada',
      failed: 'Error en ingestión',
    };
    return titles[this.status] || 'Estado desconocido';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      processing: 'Procesando',
      completed: 'Completado',
      failed: 'Fallido',
    };
    return labels[status] || status;
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' {
    const severities: Record<string, 'success' | 'info' | 'warn' | 'danger'> = {
      pending: 'info',
      processing: 'warn',
      completed: 'success',
      failed: 'danger',
    };
    return severities[status] || 'info';
  }

  getProcessingMessage(): string {
    if (this.progress < 20) return 'Extrayendo texto del documento...';
    if (this.progress < 40) return 'Dividiendo texto en chunks...';
    if (this.progress < 70) return 'Generando embeddings vectoriales...';
    if (this.progress < 95) return 'Almacenando chunks en la base de datos...';
    return 'Finalizando ingestión...';
  }

  private startTimer(): void {
    this.startTime = Date.now();
    this.timerSubscription = interval(1000).subscribe(() => {
      const elapsed = Math.floor((Date.now() - (this.startTime || Date.now())) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      this.elapsedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    });
  }

  private stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = undefined;
    }
  }
}
