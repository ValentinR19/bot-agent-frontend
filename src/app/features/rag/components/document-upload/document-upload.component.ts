/**
 * Document Upload Component
 * Componente para subir documentos (PDF, TXT, CSV)
 */

import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentType } from '../../models/knowledge-document.model';
import { RagStateService } from '../../services/rag-state.service';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { Select } from 'primeng/select';
import { ChipsModule } from 'primeng/chips';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, FileUploadModule, Select, ChipsModule, ToastModule, ProgressBarModule],
  providers: [MessageService],
  template: `
    <p-dialog [(visible)]="visible" [modal]="true" [style]="{ width: '600px' }" header="Subir documento" (onHide)="onClose()">
      <div class="upload-container">
        <!-- Tipo de documento -->
        <div class="form-field">
          <label for="docType">Tipo de documento *</label>
          <p-select id="docType" [(ngModel)]="selectedType" [options]="documentTypes" optionLabel="label" optionValue="value" placeholder="Seleccionar tipo" class="w-full"></p-select>
          <small class="text-gray-500">Selecciona el tipo que mejor describe el contenido</small>
        </div>

        <!-- Tags -->
        <div class="form-field">
          <label for="tags">Tags (opcional)</label>
          <p-chips id="tags" [(ngModel)]="tags" placeholder="Agregar tag y presionar Enter" class="w-full"></p-chips>
          <small class="text-gray-500">Útil para filtrar y organizar documentos</small>
        </div>

        <!-- File upload -->
        <div class="form-field">
          <label>Archivo *</label>
          <p-fileUpload
            mode="basic"
            name="file"
            [auto]="false"
            [customUpload]="true"
            (uploadHandler)="onFileSelect($event)"
            [maxFileSize]="10000000"
            accept=".pdf,.txt,.csv"
            [chooseLabel]="selectedFile ? selectedFile.name : 'Seleccionar archivo'"
            [disabled]="isUploading"
          ></p-fileUpload>
          <small class="text-gray-500">Formatos soportados: PDF, TXT, CSV (máx. 10MB)</small>
        </div>

        <!-- Preview de archivo seleccionado -->
        <div class="file-preview" *ngIf="selectedFile">
          <div class="flex align-items-center justify-content-between p-3 border-round" style="background: #f8f9fa">
            <div class="flex align-items-center gap-2">
              <i class="pi pi-file text-2xl text-primary"></i>
              <div>
                <div class="font-semibold">{{ selectedFile.name }}</div>
                <small class="text-gray-500">{{ formatSize(selectedFile.size) }}</small>
              </div>
            </div>
            <p-button icon="pi pi-times" [text]="true" [rounded]="true" severity="danger" (onClick)="clearFile()"></p-button>
          </div>
        </div>

        <!-- Progress bar -->
        <p-progressBar *ngIf="isUploading" [value]="uploadProgress" [showValue]="true"></p-progressBar>
      </div>

      <ng-template pTemplate="footer">
        <div class="flex gap-2 justify-content-end">
          <p-button label="Cancelar" severity="secondary" (onClick)="onClose()" [disabled]="isUploading"></p-button>
          <p-button label="Subir" icon="pi pi-upload" (onClick)="onUpload()" [disabled]="!canUpload()" [loading]="isUploading"></p-button>
        </div>
      </ng-template>
    </p-dialog>

    <p-toast></p-toast>
  `,
  styles: [
    `
      .upload-container {
        padding: 1rem 0;
      }

      .form-field {
        margin-bottom: 1.5rem;
      }

      .form-field label {
        display: block;
        font-weight: 600;
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
        color: #495057;
      }

      .form-field small {
        display: block;
        margin-top: 0.25rem;
        font-size: 0.75rem;
      }

      .file-preview {
        margin-top: 1rem;
        margin-bottom: 1rem;
      }

      ::ng-deep .p-fileupload-choose {
        width: 100%;
      }
    `,
  ],
})
export class DocumentUploadComponent {
  private ragState = inject(RagStateService);
  private messageService = inject(MessageService);

  @Output() uploadComplete = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  visible = false;
  selectedFile: File | null = null;
  selectedType: DocumentType = DocumentType.GENERAL;
  tags: string[] = [];
  isUploading = false;
  uploadProgress = 0;

  documentTypes = [
    { label: 'FAQ - Preguntas Frecuentes', value: DocumentType.FAQ },
    { label: 'Catálogo de Productos', value: DocumentType.PRODUCT_CATALOG },
    { label: 'Manual Técnico', value: DocumentType.MANUAL },
    { label: 'Política Interna', value: DocumentType.POLICY },
    { label: 'General', value: DocumentType.GENERAL },
  ];

  open(): void {
    this.visible = true;
    this.reset();
  }

  onClose(): void {
    if (!this.isUploading) {
      this.visible = false;
      this.reset();
      this.close.emit();
    }
  }

  onFileSelect(event: any): void {
    const files = event.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
    }
  }

  clearFile(): void {
    this.selectedFile = null;
  }

  canUpload(): boolean {
    return !!this.selectedFile && !!this.selectedType && !this.isUploading;
  }

  onUpload(): void {
    if (!this.canUpload() || !this.selectedFile) return;

    this.isUploading = true;
    this.uploadProgress = 0;

    // Simular progreso (en producción, usar HttpEventType.UploadProgress)
    const progressInterval = setInterval(() => {
      if (this.uploadProgress < 90) {
        this.uploadProgress += 10;
      }
    }, 200);

    this.ragState.uploadDocument(this.selectedFile, this.selectedType, this.tags).subscribe({
      next: (response) => {
        clearInterval(progressInterval);
        this.uploadProgress = 100;

        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Documento subido correctamente. La ingestión comenzará automáticamente.',
        });

        setTimeout(() => {
          this.uploadComplete.emit();
          this.onClose();
        }, 1000);
      },
      error: (err) => {
        clearInterval(progressInterval);
        this.isUploading = false;
        this.uploadProgress = 0;

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message || 'Error al subir documento',
        });
      },
    });
  }

  formatSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  }

  private reset(): void {
    this.selectedFile = null;
    this.selectedType = DocumentType.GENERAL;
    this.tags = [];
    this.isUploading = false;
    this.uploadProgress = 0;
  }
}
