import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { ChipsModule } from 'primeng/chips';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { KnowledgeService } from '../../services/knowledge.service';
import { CreateKnowledgeDocumentDto, UpdateKnowledgeDocumentDto, DocumentType, DocumentSourceType } from '../../models/knowledge.model';

interface KnowledgeDocumentForm {
  title: FormControl<string>;
  type: FormControl<DocumentType>;
  content: FormControl<string>;
  sourceType: FormControl<DocumentSourceType | null>;
  sourceUrl: FormControl<string | null>;
  fileName: FormControl<string | null>;
  mimeType: FormControl<string | null>;
  tags: FormControl<string[]>;
}

@Component({
  selector: 'app-knowledge-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, InputTextModule, Textarea, Select, ChipsModule, ToastModule],
  providers: [MessageService],
  templateUrl: './knowledge-form.component.html',
  styleUrl: './knowledge-form.component.scss',
})
export class KnowledgeFormComponent implements OnInit, OnDestroy {
  private readonly knowledgeService = inject(KnowledgeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly destroy$ = new Subject<void>();

  documentForm!: FormGroup<KnowledgeDocumentForm>;
  isEditMode = false;
  documentId: string | null = null;
  saving = false;

  documentTypes = [
    { label: 'FAQ', value: 'faq' as DocumentType },
    { label: 'Catálogo de Productos', value: 'product_catalog' as DocumentType },
    { label: 'Manual', value: 'manual' as DocumentType },
    { label: 'Política', value: 'policy' as DocumentType },
    { label: 'General', value: 'general' as DocumentType },
  ];

  sourceTypes = [
    { label: 'Archivo', value: 'file' as DocumentSourceType },
    { label: 'URL', value: 'url' as DocumentSourceType },
    { label: 'Manual', value: 'manual' as DocumentSourceType },
    { label: 'API', value: 'api' as DocumentSourceType },
  ];

  ngOnInit(): void {
    this.initForm();
    this.documentId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.documentId && this.route.snapshot.url.some((segment) => segment.path === 'edit');

    if (this.isEditMode && this.documentId) {
      this.loadDocument(this.documentId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.documentForm = new FormGroup<KnowledgeDocumentForm>({
      title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      type: new FormControl('general' as DocumentType, { nonNullable: true, validators: [Validators.required] }),
      content: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      sourceType: new FormControl<DocumentSourceType | null>('manual' as DocumentSourceType),
      sourceUrl: new FormControl<string | null>(''),
      fileName: new FormControl<string | null>(''),
      mimeType: new FormControl<string | null>(''),
      tags: new FormControl<string[]>([], { nonNullable: true }),
    });
  }

  loadDocument(id: string): void {
    this.knowledgeService
      .findOne(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (document) => {
          this.documentForm.patchValue({
            title: document.title,
            type: document.type,
            sourceType: document.sourceType ?? null,
            sourceUrl: document.sourceUrl ?? null,
            fileName: document.fileName ?? null,
            mimeType: document.mimeType ?? null,
            tags: document.tags,
          });

          // En modo edición, el contenido no es editable si ya fue procesado
          if (document.status === 'completed') {
            this.documentForm.controls.content.disable();
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

      // Limpiar campos vacíos y null
      const payload = Object.keys(formValue).reduce((acc, key) => {
        const value = (formValue as any)[key];
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      const operation =
        this.isEditMode && this.documentId
          ? this.knowledgeService.update(this.documentId, payload as UpdateKnowledgeDocumentDto)
          : this.knowledgeService.create(payload as CreateKnowledgeDocumentDto);

      operation.pipe(takeUntil(this.destroy$)).subscribe({
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
