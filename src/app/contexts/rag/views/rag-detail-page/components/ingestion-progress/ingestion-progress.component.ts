/**
 * Ingestion Progress Component
 * Muestra el progreso de ingestión de un documento con estados y timer
 */

import { Component, Input, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subject, takeUntil } from 'rxjs';
import { IngestionStatus } from '../../../../models/knowledge-document.model';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { BadgeModule } from 'primeng/badge';
import { ChipModule } from 'primeng/chip';

@Component({
  selector: 'app-ingestion-progress',
  standalone: true,
  imports: [CommonModule, CardModule, ProgressBarModule, BadgeModule, ChipModule],
  templateUrl: './ingestion-progress.component.html',
  styleUrls: ['./ingestion-progress.component.scss'],
})
export class IngestionProgressComponent implements OnInit, OnDestroy, OnChanges {
  @Input() status: IngestionStatus = IngestionStatus.PENDING;
  @Input() progress = 0;
  @Input() chunkCount = 0;
  @Input() errorMessage?: string;

  elapsedTime = '00:00';
  private startTime?: number;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    if (this.status === IngestionStatus.PROCESSING) {
      this.startTimer();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(): void {
    if (this.status === IngestionStatus.PROCESSING && !this.startTime) {
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
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const elapsed = Math.floor((Date.now() - (this.startTime || Date.now())) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        this.elapsedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      });
  }

  private stopTimer(): void {
    this.startTime = undefined;
  }
}
