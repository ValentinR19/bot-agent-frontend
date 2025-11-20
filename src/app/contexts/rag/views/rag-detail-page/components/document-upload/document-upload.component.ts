/**
 * Document Upload Component
 * Componente para subir documentos (PDF, TXT, CSV)
 */

import { Component, inject, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { DocumentType } from '../../../../models/knowledge-document.model';
import { RagStateService } from '../../../../services/rag-state.service';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { Select } from 'primeng/select';
import { ChipsModule } from 'primeng/chips';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';

interface UploadForm {
  type: FormControl<DocumentType>;
  tags: FormControl<string[]>;
}

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogModule, ButtonModule, FileUploadModule, Select, ChipsModule, ToastModule, ProgressBarModule],
  providers: [MessageService],
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.scss'],
})
export class DocumentUploadComponent implements OnDestroy {
  private ragState = inject(RagStateService);
  private messageService = inject(MessageService);
  private destroy$ = new Subject<void>();

  @Output() uploadComplete = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  visible = false;
  selectedFile: File | null = null;
  isUploading = false;
  uploadProgress = 0;

  uploadForm = new FormGroup<UploadForm>({
    type: new FormControl<DocumentType>(DocumentType.GENERAL, { nonNullable: true }),
    tags: new FormControl<string[]>([], { nonNullable: true }),
  });

  documentTypes = [
    { label: 'FAQ - Preguntas Frecuentes', value: DocumentType.FAQ },
    { label: 'Catálogo de Productos', value: DocumentType.PRODUCT_CATALOG },
    { label: 'Manual Técnico', value: DocumentType.MANUAL },
    { label: 'Política Interna', value: DocumentType.POLICY },
    { label: 'General', value: DocumentType.GENERAL },
  ];

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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
    return !!this.selectedFile && !!this.uploadForm.value.type && !this.isUploading;
  }

  onUpload(): void {
    if (!this.canUpload() || !this.selectedFile) return;

    this.isUploading = true;
    this.uploadProgress = 0;

    const formValue = this.uploadForm.getRawValue();

    // Simular progreso (en producción, usar HttpEventType.UploadProgress)
    const progressInterval = setInterval(() => {
      if (this.uploadProgress < 90) {
        this.uploadProgress += 10;
      }
    }, 200);

    this.ragState
      .uploadDocument(this.selectedFile, formValue.type, formValue.tags)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
    this.uploadForm.reset({
      type: DocumentType.GENERAL,
      tags: [],
    });
    this.isUploading = false;
    this.uploadProgress = 0;
  }
}
