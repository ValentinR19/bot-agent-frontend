import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CreateFlowDto, UpdateFlowDto } from '../flows.model';
import { FlowsService } from '../flows.service';

@Component({
  selector: 'app-flows-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, InputTextModule, TextareaModule, ToggleSwitchModule, ToastModule, ChipModule],
  providers: [MessageService],
  template: `
    <div class="flows-form-page">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-content-between align-items-center p-3">
            <h2>{{ isEditMode ? 'Editar Flujo' : 'Nuevo Flujo' }}</h2>
            <p-button label="Volver" icon="pi pi-arrow-left" severity="secondary" (onClick)="goBack()"></p-button>
          </div>
        </ng-template>

        <form [formGroup]="flowForm" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <!-- Nombre -->
            <div class="form-field">
              <label for="name" class="required">Nombre</label>
              <input
                id="name"
                type="text"
                pInputText
                formControlName="name"
                placeholder="Ej: Flujo de Bienvenida"
                [class.ng-invalid]="flowForm.get('name')?.invalid && flowForm.get('name')?.touched"
              />
              <small class="p-error" *ngIf="flowForm.get('name')?.invalid && flowForm.get('name')?.touched"> El nombre es requerido (mínimo 3 caracteres) </small>
            </div>

            <!-- Slug -->
            <div class="form-field">
              <label for="slug" class="required">Slug</label>
              <input
                id="slug"
                type="text"
                pInputText
                formControlName="slug"
                placeholder="Ej: flujo-bienvenida"
                [class.ng-invalid]="flowForm.get('slug')?.invalid && flowForm.get('slug')?.touched"
              />
              <small class="p-hint">Solo letras minúsculas, números y guiones</small>
              <small class="p-error" *ngIf="flowForm.get('slug')?.invalid && flowForm.get('slug')?.touched"> El slug es requerido y debe ser válido </small>
            </div>

            <!-- Estado Activo -->
            <div class="form-field">
              <label for="isActive">Estado Activo</label>
              <p-inputSwitch id="isActive" formControlName="isActive"></p-inputSwitch>
            </div>

            <!-- Flujo por Defecto -->
            <div class="form-field">
              <label for="isDefault">Flujo por Defecto</label>
              <p-inputSwitch id="isDefault" formControlName="isDefault"></p-inputSwitch>
            </div>
          </div>

          <!-- Descripción -->
          <div class="form-field-full">
            <label for="description">Descripción</label>
            <textarea id="description" pInputTextarea formControlName="description" placeholder="Describe el propósito de este flujo..." rows="3"></textarea>
          </div>

          <!-- Configuración (JSON) -->
          <div class="form-field-full">
            <label for="config">Configuración (JSON)</label>
            <textarea
              id="config"
              pInputTextarea
              formControlName="configJson"
              placeholder='{"timeout": 30000, "maxRetries": 3, "fallbackMessage": "Lo siento..."}'
              rows="5"
              [class.ng-invalid]="flowForm.get('configJson')?.invalid && flowForm.get('configJson')?.touched"
            ></textarea>
            <small class="p-hint">Formato JSON válido (opcional)</small>
            <small class="p-error" *ngIf="flowForm.get('configJson')?.invalid && flowForm.get('configJson')?.touched"> JSON inválido </small>
          </div>

          <!-- Metadata (JSON) -->
          <div class="form-field-full">
            <label for="metadata">Metadatos (JSON)</label>
            <textarea
              id="metadata"
              pInputTextarea
              formControlName="metadataJson"
              placeholder='{"category": "onboarding", "priority": "high"}'
              rows="5"
              [class.ng-invalid]="flowForm.get('metadataJson')?.invalid && flowForm.get('metadataJson')?.touched"
            ></textarea>
            <small class="p-hint">Formato JSON válido (opcional)</small>
            <small class="p-error" *ngIf="flowForm.get('metadataJson')?.invalid && flowForm.get('metadataJson')?.touched"> JSON inválido </small>
          </div>

          <div class="form-actions">
            <p-button label="Cancelar" severity="secondary" (onClick)="goBack()" type="button"></p-button>
            <p-button [label]="isEditMode ? 'Actualizar' : 'Crear'" icon="pi pi-save" type="submit" [disabled]="flowForm.invalid || saving" [loading]="saving"></p-button>
          </div>
        </form>
      </p-card>

      <p-toast></p-toast>
    </div>
  `,
  styles: [
    `
      .flows-form-page {
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

      .form-field-full {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
      }

      .form-field label,
      .form-field-full label {
        font-weight: 600;
        font-size: 0.875rem;
      }

      .form-field label.required::after,
      .form-field-full label.required::after {
        content: ' *';
        color: #e24c4c;
      }

      .form-field input,
      .form-field-full textarea {
        width: 100%;
      }

      .p-hint {
        font-size: 0.75rem;
        color: #6c757d;
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
    `,
  ],
})
export class FlowsFormPage implements OnInit {
  private fb = inject(FormBuilder);
  private flowsService = inject(FlowsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  flowForm!: FormGroup;
  isEditMode = false;
  flowId: string | null = null;
  saving = false;

  ngOnInit(): void {
    this.initForm();
    this.flowId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.flowId && this.route.snapshot.url.some((segment) => segment.path === 'edit');

    if (this.isEditMode && this.flowId) {
      this.loadFlow(this.flowId);
    }
  }

  initForm(): void {
    this.flowForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      description: [''],
      isActive: [true],
      isDefault: [false],
      configJson: ['{}', this.jsonValidator],
      metadataJson: ['{}', this.jsonValidator],
    });
  }

  jsonValidator(control: any) {
    if (!control.value) return null;
    try {
      JSON.parse(control.value);
      return null;
    } catch (e) {
      return { invalidJson: true };
    }
  }

  loadFlow(id: string): void {
    this.flowsService.findOne(id).subscribe({
      next: (flow) => {
        this.flowForm.patchValue({
          name: flow.name,
          slug: flow.slug,
          description: flow.description || '',
          isActive: flow.isActive,
          isDefault: flow.isDefault,
          configJson: JSON.stringify(flow.config || {}, null, 2),
          metadataJson: JSON.stringify(flow.metadata || {}, null, 2),
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el flujo',
        });
      },
    });
  }

  onSubmit(): void {
    if (this.flowForm.valid) {
      this.saving = true;
      const formValue = this.flowForm.value;

      // Parse JSON fields
      let config, metadata;
      try {
        config = JSON.parse(formValue.configJson || '{}');
        metadata = JSON.parse(formValue.metadataJson || '{}');
      } catch (e) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'JSON inválido en configuración o metadatos',
        });
        this.saving = false;
        return;
      }

      // Clean empty objects
      const cleanConfig = Object.keys(config).length > 0 ? config : undefined;
      const cleanMetadata = Object.keys(metadata).length > 0 ? metadata : undefined;

      if (this.isEditMode && this.flowId) {
        const updateDto: UpdateFlowDto = {
          name: formValue.name,
          slug: formValue.slug,
          description: formValue.description || undefined,
          isActive: formValue.isActive,
          isDefault: formValue.isDefault,
          config: cleanConfig,
          metadata: cleanMetadata,
        };

        this.flowsService.update(this.flowId, updateDto).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Flujo actualizado correctamente',
            });
            this.saving = false;
            this.goBack();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al actualizar el flujo',
            });
            this.saving = false;
          },
        });
      } else {
        const createDto: CreateFlowDto = {
          tenantId: '', // This will be handled by the backend from the header
          name: formValue.name,
          slug: formValue.slug,
          description: formValue.description || undefined,
          isActive: formValue.isActive,
          isDefault: formValue.isDefault,
          config: cleanConfig,
          metadata: cleanMetadata,
        };

        this.flowsService.create(createDto).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Flujo creado correctamente',
            });
            this.saving = false;
            this.goBack();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al crear el flujo',
            });
            this.saving = false;
          },
        });
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/flows']);
  }
}
