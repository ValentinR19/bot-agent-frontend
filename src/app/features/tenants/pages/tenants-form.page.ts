import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TenantsService } from '../tenants.service';
import { CreateTenantDto, UpdateTenantDto } from '../tenant.model';

@Component({
  selector: 'app-tenants-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, InputTextModule, Select, InputSwitchModule, ToastModule],
  providers: [MessageService],
  template: `
    <div class="tenants-form-page">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-content-between align-items-center p-3">
            <h2>{{ isEditMode ? 'Editar Tenant' : 'Nuevo Tenant' }}</h2>
            <p-button label="Volver" icon="pi pi-arrow-left" severity="secondary" (onClick)="goBack()"></p-button>
          </div>
        </ng-template>

        <form [formGroup]="tenantForm" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <!-- Nombre -->
            <div class="form-field">
              <label for="name" class="required">Nombre</label>
              <input
                id="name"
                type="text"
                pInputText
                formControlName="name"
                placeholder="Ej: Mi Empresa"
                [class.ng-invalid]="tenantForm.get('name')?.invalid && tenantForm.get('name')?.touched"
              />
              <small class="p-error" *ngIf="tenantForm.get('name')?.invalid && tenantForm.get('name')?.touched"> El nombre es requerido (mínimo 3 caracteres) </small>
            </div>

            <!-- Slug -->
            <div class="form-field">
              <label for="slug" class="required">Slug</label>
              <input
                id="slug"
                type="text"
                pInputText
                formControlName="slug"
                placeholder="Ej: mi-empresa"
                [class.ng-invalid]="tenantForm.get('slug')?.invalid && tenantForm.get('slug')?.touched"
              />
              <small class="p-hint">Solo letras minúsculas, números y guiones</small>
              <small class="p-error" *ngIf="tenantForm.get('slug')?.invalid && tenantForm.get('slug')?.touched"> El slug es requerido y debe ser válido </small>
            </div>

            <!-- Email de Contacto -->
            <div class="form-field">
              <label for="contactEmail">Email de Contacto</label>
              <input
                id="contactEmail"
                type="email"
                pInputText
                formControlName="contactEmail"
                placeholder="contacto@empresa.com"
                [class.ng-invalid]="tenantForm.get('contactEmail')?.invalid && tenantForm.get('contactEmail')?.touched"
              />
              <small class="p-error" *ngIf="tenantForm.get('contactEmail')?.invalid && tenantForm.get('contactEmail')?.touched"> Email inválido </small>
            </div>

            <!-- Teléfono -->
            <div class="form-field">
              <label for="contactPhone">Teléfono</label>
              <input id="contactPhone" type="text" pInputText formControlName="contactPhone" placeholder="+54 11 1234-5678" />
            </div>

            <!-- Idioma -->
            <div class="form-field">
              <label for="language">Idioma</label>
              <p-select
                id="language"
                formControlName="language"
                [options]="languages"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccionar idioma"
                [style]="{ width: '100%' }"
              ></p-select>
            </div>

            <!-- Zona Horaria -->
            <div class="form-field">
              <label for="timezone">Zona Horaria</label>
              <p-select
                id="timezone"
                formControlName="timezone"
                [options]="timezones"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccionar zona horaria"
                [style]="{ width: '100%' }"
              ></p-select>
            </div>

            <!-- Proveedor LLM -->
            <div class="form-field">
              <label for="llmProvider">Proveedor LLM</label>
              <p-select
                id="llmProvider"
                formControlName="llmProvider"
                [options]="llmProviders"
                optionLabel="label"
                optionValue="value"
                placeholder="Seleccionar proveedor"
                [style]="{ width: '100%' }"
              ></p-select>
            </div>

            <!-- LLM API Key -->
            <div class="form-field" *ngIf="tenantForm.get('llmProvider')?.value">
              <label for="llmApiKey">LLM API Key</label>
              <input id="llmApiKey" type="password" pInputText formControlName="llmApiKey" placeholder="sk-..." />
              <small class="p-hint">Se guardará de forma encriptada</small>
            </div>

            <!-- Color Primario -->
            <div class="form-field">
              <label for="primaryColor">Color Primario</label>
              <input id="primaryColor" type="color" pInputText formControlName="primaryColor" />
            </div>

            <!-- Logo URL -->
            <div class="form-field">
              <label for="logoUrl">URL del Logo</label>
              <input id="logoUrl" type="url" pInputText formControlName="logoUrl" placeholder="https://ejemplo.com/logo.png" />
            </div>
          </div>

          <div class="form-actions">
            <p-button label="Cancelar" severity="secondary" (onClick)="goBack()" type="button"></p-button>
            <p-button [label]="isEditMode ? 'Actualizar' : 'Crear'" icon="pi pi-save" type="submit" [disabled]="tenantForm.invalid || saving" [loading]="saving"></p-button>
          </div>
        </form>
      </p-card>

      <p-toast></p-toast>
    </div>
  `,
  styles: [
    `
      .tenants-form-page {
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

      .form-field label {
        font-weight: 600;
        font-size: 0.875rem;
      }

      .form-field label.required::after {
        content: ' *';
        color: #e24c4c;
      }

      .form-field input,
      .form-field p-select {
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
export class TenantsFormPage implements OnInit {
  private fb = inject(FormBuilder);
  private tenantsService = inject(TenantsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  tenantForm!: FormGroup;
  isEditMode = false;
  tenantId: string | null = null;
  saving = false;

  languages = [
    { label: 'Español', value: 'es' },
    { label: 'English', value: 'en' },
    { label: 'Português', value: 'pt' },
  ];

  timezones = [
    { label: 'UTC', value: 'UTC' },
    { label: 'America/Argentina/Buenos_Aires', value: 'America/Argentina/Buenos_Aires' },
    { label: 'America/New_York', value: 'America/New_York' },
    { label: 'America/Los_Angeles', value: 'America/Los_Angeles' },
    { label: 'Europe/Madrid', value: 'Europe/Madrid' },
  ];

  llmProviders = [
    { label: 'OpenAI', value: 'openai' },
    { label: 'Anthropic', value: 'anthropic' },
  ];

  ngOnInit(): void {
    // Determinar modo de edición ANTES de inicializar el formulario
    this.tenantId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.tenantId && this.route.snapshot.url.some((segment) => segment.path === 'edit');

    // Inicializar formulario
    this.initForm();

    if (this.isEditMode && this.tenantId) {
      this.loadTenant(this.tenantId);
    }
  }

  initForm(): void {
    this.tenantForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      contactEmail: ['', [Validators.email]],
      contactPhone: [''],
      language: ['es'],
      timezone: ['UTC'],
      llmProvider: [''],
      llmApiKey: [''],
      primaryColor: ['#007bff'],
      logoUrl: [''],
    });
  }

  loadTenant(id: string): void {
    this.tenantsService.findOne(id).subscribe({
      next: (tenant) => {
        this.tenantForm.patchValue({
          name: tenant.name,
          slug: tenant.slug,
          contactEmail: tenant.contactEmail,
          contactPhone: tenant.contactPhone,
          language: tenant.language || 'es',
          timezone: tenant.timezone || 'UTC',
          llmProvider: tenant.llmProvider,
          primaryColor: tenant.primaryColor || '#007bff',
          logoUrl: tenant.logoUrl,
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el tenant',
        });
      },
    });
  }

  onSubmit(): void {
    if (this.tenantForm.valid) {
      this.saving = true;
      const formValue = this.tenantForm.value;

      // Limpiar campos vacíos
      const payload = Object.keys(formValue).reduce((acc, key) => {
        if (formValue[key] !== '' && formValue[key] !== null) {
          acc[key] = formValue[key];
        }
        return acc;
      }, {} as any);

      const operation =
        this.isEditMode && this.tenantId ? this.tenantsService.update(this.tenantId, payload as UpdateTenantDto) : this.tenantsService.create(payload as CreateTenantDto);

      operation.subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Tenant ${this.isEditMode ? 'actualizado' : 'creado'} correctamente`,
          });
          this.saving = false;
          this.goBack();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Error al ${this.isEditMode ? 'actualizar' : 'crear'} el tenant`,
          });
          this.saving = false;
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/tenants']);
  }
}
