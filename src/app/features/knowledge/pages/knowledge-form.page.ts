import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { ChipsModule } from 'primeng/chips';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { KnowledgeService } from '../knowledge.service';
import { CreateKnowledgeDocumentDto, UpdateKnowledgeDocumentDto } from '../knowledge.model';

@Component({
  selector: 'app-knowledge-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    Textarea,
    Select,
    ChipsModule,
    ToastModule,
  ],
  providers: [MessageService],
  template: `
    <div class="knowledge-form-page">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-content-between align-items-center p-3">
            <h2>{{ isEditMode ? 'Editar Documento' : 'Nuevo Documento' }}</h2>
            <p-button
              label="Volver"
              icon="pi pi-arrow-left"
              severity="secondary"
              (onClick)="goBack()"
            ></p-button>
          </div>
        </ng-template>

        <form [formGroup]="documentForm" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <!-- Título -->
            <div class="form-field">
              <label for="title" class="required">Título</label>
              <input
                id="title"
                type="text"
                pInputText
                formControlName="title"
                placeholder="Ej: Manual de Usuario"
                [class.ng-invalid]="
                  documentForm.get('title')?.invalid &&
                  documentForm.get('title')?.touched
                "
              />
              <small
                class="p-error"
                *ngIf="
                  documentForm.get('title')?.invalid &&
                  documentForm.get('title')?.touched
                "
              >
                El título es requerido
              </small>
            </div>

            <!-- Tipo -->
            <div class="form-field">
              <label for="type" class="required">Tipo</label>
              <p-select
                id="type"
                formControlName="type"
                [options]="documentTypes"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccionar tipo"
                [style]="{ width: '100%' }"
              ></p-select>
            </div>

            <!-- Tipo de Origen -->
            <div class="form-field">
              <label for="sourceType">Tipo de Origen</label>
              <p-select
                id="sourceType"
                formControlName="sourceType"
                [options]="sourceTypes"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccionar origen"
                [style]="{ width: '100%' }"
              ></p-select>
            </div>

            <!-- URL de Origen -->
            <div class="form-field">
              <label for="sourceUrl">URL de Origen</label>
              <input
                id="sourceUrl"
                type="url"
                pInputText
                formControlName="sourceUrl"
                placeholder="https://ejemplo.com/documento"
              />
            </div>

            <!-- Nombre de Archivo -->
            <div class="form-field">
              <label for="fileName">Nombre de Archivo</label>
              <input
                id="fileName"
                type="text"
                pInputText
                formControlName="fileName"
                placeholder="documento.pdf"
              />
            </div>

            <!-- Tipo MIME -->
            <div class="form-field">
              <label for="mimeType">Tipo MIME</label>
              <input
                id="mimeType"
                type="text"
                pInputText
                formControlName="mimeType"
                placeholder="application/pdf"
              />
            </div>

            <!-- Contenido -->
            <div class="form-field full-width">
              <label for="content" class="required">Contenido</label>
              <textarea
                id="content"
                pInputTextarea
                formControlName="content"
                placeholder="Contenido del documento"
                rows="10"
                [class.ng-invalid]="
                  documentForm.get('content')?.invalid &&
                  documentForm.get('content')?.touched
                "
              ></textarea>
              <small
                class="p-error"
                *ngIf="
                  documentForm.get('content')?.invalid &&
                  documentForm.get('content')?.touched
                "
              >
                El contenido es requerido
              </small>
            </div>

            <!-- Tags -->
            <div class="form-field full-width">
              <label for="tags">Tags</label>
              <p-chips
                id="tags"
                formControlName="tags"
                placeholder="Añadir tag"
                [style]="{ width: '100%' }"
              ></p-chips>
            </div>
          </div>

          <div class="form-actions">
            <p-button
              label="Cancelar"
              severity="secondary"
              (onClick)="goBack()"
              type="button"
            ></p-button>
            <p-button
              [label]="isEditMode ? 'Actualizar' : 'Crear'"
              icon="pi pi-save"
              type="submit"
              [disabled]="documentForm.invalid || saving"
              [loading]="saving"
            ></p-button>
          </div>
        </form>
      </p-card>

      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .knowledge-form-page {
      padding: 1.5rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-field.full-width {
      grid-column: 1 / -1;
    }

    .form-field label {
      font-weight: 600;
      font-size: 0.875rem;
    }

    .form-field label.required::after {
      content: ' *';
      color: #e24c4c;
    }

    .form-field input,
    .form-field textarea {
      width: 100%;
    }

    .p-error {
      font-size: 0.75rem;
      color: #e24c4c;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #dee2e6;
    }
  `],
})
export class KnowledgeFormPage implements OnInit {
  private fb = inject(FormBuilder);
  private knowledgeService = inject(KnowledgeService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  documentForm!: FormGroup;
  isEditMode = false;
  documentId: string | null = null;
  saving = false;

  documentTypes = [
    { label: 'FAQ', value: 'faq' },
    { label: 'Catálogo de Productos', value: 'product_catalog' },
    { label: 'Manual', value: 'manual' },
    { label: 'Política', value: 'policy' },
    { label: 'General', value: 'general' },
  ];

  sourceTypes = [
    { label: 'Archivo', value: 'file' },
    { label: 'URL', value: 'url' },
    { label: 'Manual', value: 'manual' },
    { label: 'API', value: 'api' },
  ];

  ngOnInit(): void {
    this.initForm();
    this.documentId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.documentId && this.route.snapshot.url.some(segment => segment.path === 'edit');

    if (this.isEditMode && this.documentId) {
      this.loadDocument(this.documentId);
    }
  }

  initForm(): void {
    this.documentForm = this.fb.group({
      title: ['', [Validators.required]],
      type: ['general', [Validators.required]],
      content: ['', [Validators.required]],
      sourceType: ['manual'],
      sourceUrl: [''],
      fileName: [''],
      mimeType: [''],
      tags: [[]],
    });
  }

  loadDocument(id: string): void {
    this.knowledgeService.findOne(id).subscribe({
      next: (document) => {
        this.documentForm.patchValue({
          title: document.title,
          type: document.type,
          sourceType: document.sourceType,
          sourceUrl: document.sourceUrl,
          fileName: document.fileName,
          mimeType: document.mimeType,
          tags: document.tags,
        });

        // En modo edición, el contenido no es editable si ya fue procesado
        if (document.status === 'completed') {
          this.documentForm.get('content')?.disable();
          this.messageService.add({
            severity: 'info',
            summary: 'Info',
            detail: 'El contenido no puede editarse en documentos ya procesados',
          });
        }
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el documento',
        });
      },
    });
  }

  onSubmit(): void {
    if (this.documentForm.valid) {
      this.saving = true;
      const formValue = this.documentForm.getRawValue(); // getRawValue para incluir campos disabled

      // Limpiar campos vacíos
      const payload = Object.keys(formValue).reduce((acc, key) => {
        if (formValue[key] !== '' && formValue[key] !== null) {
          acc[key] = formValue[key];
        }
        return acc;
      }, {} as any);

      const operation = this.isEditMode && this.documentId
        ? this.knowledgeService.update(this.documentId, payload as UpdateKnowledgeDocumentDto)
        : this.knowledgeService.create(payload as CreateKnowledgeDocumentDto);

      operation.subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Documento ${this.isEditMode ? 'actualizado' : 'creado'} correctamente`,
          });
          this.saving = false;
          this.goBack();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Error al ${this.isEditMode ? 'actualizar' : 'crear'} el documento`,
          });
          this.saving = false;
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/knowledge']);
  }
}
