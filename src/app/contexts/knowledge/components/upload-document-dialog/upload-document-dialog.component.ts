import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { TabView } from 'primeng/tabview';
import { FileUpload, FileUploadHandlerEvent } from 'primeng/fileupload';
import { Select } from 'primeng/select';
import { Chips } from 'primeng/chips';
import { Button } from 'primeng/button';
import { ProgressBar } from 'primeng/progressbar';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { KnowledgeDocument, CreateKnowledgeDocumentDto, DocumentType } from '../../models/knowledge.model';
import { KnowledgeService } from '../../services/knowledge.service';

interface UploadFormControls {
  type: FormControl<DocumentType | null>;
  title: FormControl<string>;
  tags: FormControl<string[]>;
}

interface ManualFormControls {
  type: FormControl<DocumentType | null>;
  title: FormControl<string>;
  content: FormControl<string>;
  tags: FormControl<string[]>;
}

/**
 * Dialog para subir documentos con dos modos:
 * - Upload de archivo (PDF, TXT, CSV)
 * - Ingesta manual (texto directo)
 */
@Component({
  selector: 'app-upload-document-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Dialog,
    TabView,
    FileUpload,
    Select,
    Chips,
    Button,
    ProgressBar,
    InputText,
    Textarea,
  ],
  templateUrl: './upload-document-dialog.component.html',
  styleUrl: './upload-document-dialog.component.scss',
})
export class UploadDocumentDialogComponent implements OnInit {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() documentUploaded = new EventEmitter<KnowledgeDocument>();

  private readonly fb = inject(FormBuilder);
  private readonly knowledgeService = inject(KnowledgeService);
  private readonly messageService = inject(MessageService);

  uploading = false;
  uploadProgress = 0;
  selectedFile: File | null = null;
  activeTabIndex = 0;

  readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  readonly ALLOWED_TYPES = ['application/pdf', 'text/plain', 'text/csv'];
  readonly ALLOWED_EXTENSIONS = ['.pdf', '.txt', '.csv'];

  documentTypes = [
    { label: 'FAQ', value: 'faq' as DocumentType },
    { label: 'Catálogo de Productos', value: 'product_catalog' as DocumentType },
    { label: 'Manual', value: 'manual' as DocumentType },
    { label: 'Política', value: 'policy' as DocumentType },
    { label: 'General', value: 'general' as DocumentType },
  ];

  uploadForm!: FormGroup<UploadFormControls>;
  manualForm!: FormGroup<ManualFormControls>;

  ngOnInit(): void {
    this.initForms();
  }

  private initForms(): void {
    this.uploadForm = this.fb.group<UploadFormControls>({
      type: new FormControl<DocumentType | null>(null, Validators.required),
      title: new FormControl<string>('', { nonNullable: true }),
      tags: new FormControl<string[]>([], { nonNullable: true }),
    });

    this.manualForm = this.fb.group<ManualFormControls>({
      type: new FormControl<DocumentType | null>(null, Validators.required),
      title: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(3)],
      }),
      content: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(50)],
      }),
      tags: new FormControl<string[]>([], { nonNullable: true }),
    });
  }

  onFileSelect(event: FileUploadHandlerEvent): void {
    const file = event.files[0];

    // Validar tipo
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Tipo de archivo no válido',
        detail: 'Solo se permiten archivos PDF, TXT o CSV',
      });
      return;
    }

    // Validar tamaño
    if (file.size > this.MAX_FILE_SIZE) {
      this.messageService.add({
        severity: 'error',
        summary: 'Archivo muy grande',
        detail: 'El tamaño máximo permitido es 10MB',
      });
      return;
    }

    this.selectedFile = file;

    // Auto-llenar título si está vacío
    if (!this.uploadForm.value.title) {
      const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remover extensión
      this.uploadForm.patchValue({ title: fileName });
    }
  }

  onFileRemove(): void {
    this.selectedFile = null;
  }

  submit(): void {
    if (this.activeTabIndex === 0) {
      this.uploadFile();
    } else {
      this.createManual();
    }
  }

  private uploadFile(): void {
    if (!this.selectedFile || this.uploadForm.invalid) {
      this.uploadForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('type', this.uploadForm.value.type!);

    if (this.uploadForm.value.title) {
      formData.append('title', this.uploadForm.value.title);
    }

    if (this.uploadForm.value.tags && this.uploadForm.value.tags.length > 0) {
      formData.append('tags', JSON.stringify(this.uploadForm.value.tags));
    }

    this.uploading = true;
    this.uploadProgress = 0;

    // Simular progreso (ya que no tenemos eventos de progreso reales)
    const progressInterval = setInterval(() => {
      if (this.uploadProgress < 90) {
        this.uploadProgress += 10;
      }
    }, 200);

    this.knowledgeService.upload(formData).subscribe({
      next: (document) => {
        clearInterval(progressInterval);
        this.uploadProgress = 100;

        this.messageService.add({
          severity: 'success',
          summary: 'Documento subido',
          detail: 'El documento se está procesando automáticamente',
        });

        this.documentUploaded.emit(document);
        this.close();
      },
      error: (error) => {
        clearInterval(progressInterval);
        this.messageService.add({
          severity: 'error',
          summary: 'Error al subir',
          detail: error.error?.message || 'Error al subir el documento',
        });
        this.uploading = false;
        this.uploadProgress = 0;
      },
    });
  }

  private createManual(): void {
    if (this.manualForm.invalid) {
      this.manualForm.markAllAsTouched();
      return;
    }

    const dto: CreateKnowledgeDocumentDto = {
      type: this.manualForm.value.type!,
      title: this.manualForm.value.title!,
      content: this.manualForm.value.content!,
      sourceType: 'manual',
      tags: this.manualForm.value.tags || [],
    };

    this.uploading = true;

    this.knowledgeService.create(dto).subscribe({
      next: (document) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Documento creado',
          detail: 'El documento se procesará automáticamente',
        });

        this.documentUploaded.emit(document);
        this.close();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error al crear',
          detail: error.error?.message || 'Error al crear el documento',
        });
        this.uploading = false;
      },
    });
  }

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.resetForms();
  }

  private resetForms(): void {
    this.uploadForm.reset();
    this.manualForm.reset();
    this.selectedFile = null;
    this.uploading = false;
    this.uploadProgress = 0;
    this.activeTabIndex = 0;
  }

  isValid(): boolean {
    if (this.activeTabIndex === 0) {
      return this.uploadForm.valid && !!this.selectedFile;
    } else {
      return this.manualForm.valid;
    }
  }

  get canSubmit(): boolean {
    return this.isValid() && !this.uploading;
  }
}
