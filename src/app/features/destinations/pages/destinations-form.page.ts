import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DestinationsService } from '../destinations.service';
import { CreateDestinationDto, UpdateDestinationDto, DestinationType } from '../destination.model';

@Component({
  selector: 'app-destinations-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    InputTextareaModule,
    InputSwitchModule,
    InputNumberModule,
    ToastModule,
  ],
  providers: [MessageService],
  template: `
    <div class="destinations-form-page">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-content-between align-items-center p-3">
            <h2>{{ isEditMode ? 'Editar Destino' : 'Nuevo Destino' }}</h2>
            <p-button
              label="Volver"
              icon="pi pi-arrow-left"
              severity="secondary"
              (onClick)="goBack()"
            ></p-button>
          </div>
        </ng-template>

        <form [formGroup]="destinationForm" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <!-- Nombre -->
            <div class="form-field">
              <label for="name" class="required">Nombre</label>
              <input
                id="name"
                type="text"
                pInputText
                formControlName="name"
                placeholder="Ej: API Principal"
                [class.ng-invalid]="
                  destinationForm.get('name')?.invalid &&
                  destinationForm.get('name')?.touched
                "
              />
              <small
                class="p-error"
                *ngIf="
                  destinationForm.get('name')?.invalid &&
                  destinationForm.get('name')?.touched
                "
              >
                El nombre es requerido (mínimo 3 caracteres)
              </small>
            </div>

            <!-- Tipo -->
            <div class="form-field">
              <label for="type" class="required">Tipo</label>
              <p-dropdown
                id="type"
                formControlName="type"
                [options]="typeOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccionar tipo"
                [style]="{ width: '100%' }"
              ></p-dropdown>
              <small
                class="p-error"
                *ngIf="
                  destinationForm.get('type')?.invalid &&
                  destinationForm.get('type')?.touched
                "
              >
                El tipo es requerido
              </small>
            </div>

            <!-- Estado Activo -->
            <div class="form-field">
              <label for="isActive">Estado Activo</label>
              <p-inputSwitch
                id="isActive"
                formControlName="isActive"
              ></p-inputSwitch>
            </div>
          </div>

          <!-- Descripción -->
          <div class="form-field-full">
            <label for="description">Descripción</label>
            <textarea
              id="description"
              pInputTextarea
              formControlName="description"
              placeholder="Describe el propósito de este destino..."
              rows="3"
            ></textarea>
          </div>

          <!-- Configuración (JSON) -->
          <div class="form-field-full">
            <label for="config" class="required">Configuración (JSON)</label>
            <textarea
              id="config"
              pInputTextarea
              formControlName="configJson"
              placeholder='{"url": "https://api.example.com", "apiKey": "..."}'
              rows="6"
              [class.ng-invalid]="
                destinationForm.get('configJson')?.invalid &&
                destinationForm.get('configJson')?.touched
              "
            ></textarea>
            <small class="p-hint">Formato JSON válido con la configuración específica del tipo de destino</small>
            <small
              class="p-error"
              *ngIf="
                destinationForm.get('configJson')?.invalid &&
                destinationForm.get('configJson')?.touched
              "
            >
              JSON inválido o vacío
            </small>
          </div>

          <!-- Configuración de Reintentos -->
          <div class="form-section">
            <h4>Configuración de Reintentos (Opcional)</h4>
            <div class="form-grid">
              <div class="form-field">
                <label for="maxRetries">Reintentos Máximos</label>
                <p-inputNumber
                  id="maxRetries"
                  formControlName="maxRetries"
                  [min]="0"
                  [max]="10"
                  [showButtons]="true"
                  [style]="{ width: '100%' }"
                ></p-inputNumber>
              </div>

              <div class="form-field">
                <label for="retryDelay">Retraso entre Reintentos (ms)</label>
                <p-inputNumber
                  id="retryDelay"
                  formControlName="retryDelay"
                  [min]="0"
                  [step]="100"
                  [showButtons]="true"
                  [style]="{ width: '100%' }"
                ></p-inputNumber>
              </div>

              <div class="form-field">
                <label for="backoffMultiplier">Multiplicador de Backoff</label>
                <p-inputNumber
                  id="backoffMultiplier"
                  formControlName="backoffMultiplier"
                  [min]="1"
                  [max]="5"
                  [step]="0.5"
                  [showButtons]="true"
                  [style]="{ width: '100%' }"
                ></p-inputNumber>
              </div>
            </div>
          </div>

          <!-- Límite de Tasa -->
          <div class="form-section">
            <h4>Límite de Tasa (Opcional)</h4>
            <div class="form-grid">
              <div class="form-field">
                <label for="maxRequests">Solicitudes Máximas</label>
                <p-inputNumber
                  id="maxRequests"
                  formControlName="maxRequests"
                  [min]="0"
                  [showButtons]="true"
                  [style]="{ width: '100%' }"
                ></p-inputNumber>
              </div>

              <div class="form-field">
                <label for="windowMs">Ventana de Tiempo (ms)</label>
                <p-inputNumber
                  id="windowMs"
                  formControlName="windowMs"
                  [min]="0"
                  [step]="1000"
                  [showButtons]="true"
                  [style]="{ width: '100%' }"
                ></p-inputNumber>
              </div>
            </div>
          </div>

          <!-- Metadata (JSON) -->
          <div class="form-field-full">
            <label for="metadata">Metadatos (JSON)</label>
            <textarea
              id="metadata"
              pInputTextarea
              formControlName="metadataJson"
              placeholder='{"region": "us-east-1", "environment": "production"}'
              rows="4"
              [class.ng-invalid]="
                destinationForm.get('metadataJson')?.invalid &&
                destinationForm.get('metadataJson')?.touched
              "
            ></textarea>
            <small class="p-hint">Formato JSON válido (opcional)</small>
            <small
              class="p-error"
              *ngIf="
                destinationForm.get('metadataJson')?.invalid &&
                destinationForm.get('metadataJson')?.touched
              "
            >
              JSON inválido
            </small>
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
              [disabled]="destinationForm.invalid || saving"
              [loading]="saving"
            ></p-button>
          </div>
        </form>
      </p-card>

      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .destinations-form-page {
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

    .form-section {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .form-section h4 {
      margin: 0 0 1rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: #495057;
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
    .form-field p-dropdown,
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
  `],
})
export class DestinationsFormPage implements OnInit {
  private fb = inject(FormBuilder);
  private destinationsService = inject(DestinationsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  destinationForm!: FormGroup;
  isEditMode = false;
  destinationId: string | null = null;
  saving = false;

  typeOptions = [
    { label: 'Email', value: 'email' },
    { label: 'Webhook', value: 'webhook' },
    { label: 'API', value: 'api' },
    { label: 'CRM', value: 'crm' },
    { label: 'ERP', value: 'erp' },
    { label: 'Slack', value: 'slack' },
    { label: 'WhatsApp Business', value: 'whatsapp_business' },
    { label: 'Zapier', value: 'zapier' },
    { label: 'Make', value: 'make' },
    { label: 'Personalizado', value: 'custom' },
  ];

  ngOnInit(): void {
    this.initForm();
    this.destinationId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.destinationId && this.route.snapshot.url.some(segment => segment.path === 'edit');

    if (this.isEditMode && this.destinationId) {
      this.loadDestination(this.destinationId);
    }
  }

  initForm(): void {
    this.destinationForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      type: ['', [Validators.required]],
      description: [''],
      isActive: [true],
      configJson: ['{}', [Validators.required, this.jsonValidator]],
      maxRetries: [null],
      retryDelay: [null],
      backoffMultiplier: [null],
      maxRequests: [null],
      windowMs: [null],
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

  loadDestination(id: string): void {
    this.destinationsService.getDestinationById(id).subscribe({
      next: (destination) => {
        this.destinationForm.patchValue({
          name: destination.name,
          type: destination.type,
          description: destination.description || '',
          isActive: destination.isActive,
          configJson: JSON.stringify(destination.config || {}, null, 2),
          maxRetries: destination.retryConfig?.maxRetries || null,
          retryDelay: destination.retryConfig?.retryDelay || null,
          backoffMultiplier: destination.retryConfig?.backoffMultiplier || null,
          maxRequests: destination.rateLimit?.maxRequests || null,
          windowMs: destination.rateLimit?.windowMs || null,
          metadataJson: JSON.stringify(destination.metadata || {}, null, 2),
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el destino',
        });
      },
    });
  }

  onSubmit(): void {
    if (this.destinationForm.valid) {
      this.saving = true;
      const formValue = this.destinationForm.value;

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

      // Build retry config
      const retryConfig = (formValue.maxRetries || formValue.retryDelay || formValue.backoffMultiplier) ? {
        maxRetries: formValue.maxRetries || undefined,
        retryDelay: formValue.retryDelay || undefined,
        backoffMultiplier: formValue.backoffMultiplier || undefined,
      } : undefined;

      // Build rate limit
      const rateLimit = (formValue.maxRequests || formValue.windowMs) ? {
        maxRequests: formValue.maxRequests || undefined,
        windowMs: formValue.windowMs || undefined,
      } : undefined;

      // Clean metadata
      const cleanMetadata = Object.keys(metadata).length > 0 ? metadata : undefined;

      if (this.isEditMode && this.destinationId) {
        const updateDto: UpdateDestinationDto = {
          name: formValue.name,
          type: formValue.type as DestinationType,
          description: formValue.description || undefined,
          isActive: formValue.isActive,
          config,
          retryConfig,
          rateLimit,
          metadata: cleanMetadata,
        };

        this.destinationsService.updateDestination(this.destinationId, updateDto).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Destino actualizado correctamente',
            });
            this.saving = false;
            this.goBack();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al actualizar el destino',
            });
            this.saving = false;
          },
        });
      } else {
        const createDto: CreateDestinationDto = {
          name: formValue.name,
          type: formValue.type as DestinationType,
          description: formValue.description || undefined,
          isActive: formValue.isActive,
          config,
          retryConfig,
          rateLimit,
          metadata: cleanMetadata,
        };

        this.destinationsService.createDestination(createDto).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Destino creado correctamente',
            });
            this.saving = false;
            this.goBack();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al crear el destino',
            });
            this.saving = false;
          },
        });
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/destinations']);
  }
}
