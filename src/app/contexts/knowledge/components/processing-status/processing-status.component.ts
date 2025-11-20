import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tag } from 'primeng/tag';
import { ProgressSpinner } from 'primeng/progressspinner';
import { KnowledgeDocument } from '../../models/knowledge.model';
import { DocumentProcessorMonitorService } from '../../services/document-processor-monitor.service';

/**
 * Componente para mostrar el estado de procesamiento de un documento
 * Auto-monitorea documentos en estado 'processing' o 'pending'
 */
@Component({
  selector: 'app-processing-status',
  standalone: true,
  imports: [CommonModule, Tag, ProgressSpinner],
  template: `
    <div class="flex items-center gap-2">
      <p-tag
        [value]="getStatusLabel()"
        [severity]="getSeverity()"
        [icon]="getIcon()"
      />
      @if (isProcessing()) {
        <p-progressSpinner
          styleClass="w-1rem h-1rem"
          strokeWidth="4"
          animationDuration="1s"
        />
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
      }
    `,
  ],
})
export class ProcessingStatusComponent implements OnInit {
  @Input({ required: true }) document!: KnowledgeDocument;

  private readonly monitorService = inject(DocumentProcessorMonitorService);

  ngOnInit(): void {
    // Auto-monitorear si está procesando
    if (this.monitorService.needsMonitoring(this.document.status)) {
      this.monitorService.monitorProcessing(this.document.id).subscribe({
        next: (updatedDoc) => {
          // Actualizar referencia del documento
          Object.assign(this.document, updatedDoc);
        },
        error: (err) => {
          console.error('Error monitoring document:', err);
        },
      });
    }
  }

  getStatusLabel(): string {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      processing: 'Procesando',
      completed: 'Completado',
      failed: 'Error',
    };
    return labels[this.document.status] || this.document.status;
  }

  getSeverity(): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    const severities: Record<
      string,
      'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast'
    > = {
      pending: 'info',
      processing: 'warn',
      completed: 'success',
      failed: 'danger',
    };
    return severities[this.document.status] || 'secondary';
  }

  getIcon(): string | undefined {
    const icons: Record<string, string> = {
      completed: 'pi pi-check',
      failed: 'pi pi-times',
      pending: 'pi pi-clock',
      processing: 'pi pi-spin pi-spinner',
    };
    return icons[this.document.status];
  }

  isProcessing(): boolean {
    return this.document.status === 'processing';
  }
}
