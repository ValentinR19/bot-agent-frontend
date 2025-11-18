import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { CreatePermissionDto, UpdatePermissionDto } from '../permission.model';
import { PermissionsService } from '../permissions.service';

@Component({
  selector: 'app-permissions-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    ToastModule,
  ],
  providers: [MessageService],
  template: `
    <div class="permissions-form-page">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-content-between align-items-center p-3">
            <h2>{{ isEditMode ? 'Editar Permiso' : 'Nuevo Permiso' }}</h2>
            <p-button
              label="Volver"
              icon="pi pi-arrow-left"
              severity="secondary"
              (onClick)="goBack()"
            ></p-button>
          </div>
        </ng-template>

        <form [formGroup]="permissionForm" (ngSubmit)="onSubmit()">
          <!-- Key (solo en modo creación) -->
          <div class="form-field" *ngIf="!isEditMode">
            <label for="key" class="required">Clave (Key)</label>
            <input
              id="key"
              type="text"
              pInputText
              formControlName="key"
              placeholder="Ej: users.create"
              [class.ng-invalid]="
                permissionForm.get('key')?.invalid &&
                permissionForm.get('key')?.touched
              "
            />
            <small class="p-hint">Formato: modulo.accion (ej: users.create, flows.update)</small>
            <small
              class="p-error"
              *ngIf="
                permissionForm.get('key')?.invalid &&
                permissionForm.get('key')?.touched
              "
            >
              La clave es requerida y debe seguir el formato modulo.accion
            </small>
          </div>

          <!-- Key (modo edición - solo lectura) -->
          <div class="form-field" *ngIf="isEditMode">
            <label for="keyReadonly">Clave (Key)</label>
            <input
              id="keyReadonly"
              type="text"
              pInputText
              [value]="permissionKey"
              [readonly]="true"
              [disabled]="true"
            />
            <small class="p-hint">La clave no puede ser modificada</small>
          </div>

          <!-- Module -->
          <div class="form-field">
            <label for="module" class="required">Módulo</label>
            <input
              id="module"
              type="text"
              pInputText
              formControlName="module"
              placeholder="Ej: users, flows, tenants"
              [class.ng-invalid]="
                permissionForm.get('module')?.invalid &&
                permissionForm.get('module')?.touched
              "
            />
            <small class="p-hint">Nombre del módulo al que pertenece este permiso</small>
            <small
              class="p-error"
              *ngIf="
                permissionForm.get('module')?.invalid &&
                permissionForm.get('module')?.touched
              "
            >
              El módulo es requerido
            </small>
          </div>

          <!-- Description -->
          <div class="form-field-full">
            <label for="description" class="required">Descripción</label>
            <textarea
              id="description"
              pInputTextarea
              formControlName="description"
              placeholder="Describe qué permite hacer este permiso..."
              rows="4"
              [class.ng-invalid]="
                permissionForm.get('description')?.invalid &&
                permissionForm.get('description')?.touched
              "
            ></textarea>
            <small class="p-hint">Descripción clara de la acción que permite este permiso</small>
            <small
              class="p-error"
              *ngIf="
                permissionForm.get('description')?.invalid &&
                permissionForm.get('description')?.touched
              "
            >
              La descripción es requerida (mínimo 10 caracteres)
            </small>
          </div>

          <!-- Ejemplos de permisos comunes -->
          <div class="examples-section" *ngIf="!isEditMode">
            <h4>Ejemplos de permisos comunes:</h4>
            <div class="examples-grid">
              <div class="example-item" (click)="fillExample('users.create', 'users', 'Permite crear nuevos usuarios')">
                <strong>users.create</strong>
                <small>Crear usuarios</small>
              </div>
              <div class="example-item" (click)="fillExample('flows.update', 'flows', 'Permite actualizar flujos conversacionales')">
                <strong>flows.update</strong>
                <small>Actualizar flujos</small>
              </div>
              <div class="example-item" (click)="fillExample('conversations.read', 'conversations', 'Permite leer y visualizar conversaciones')">
                <strong>conversations.read</strong>
                <small>Leer conversaciones</small>
              </div>
              <div class="example-item" (click)="fillExample('destinations.delete', 'destinations', 'Permite eliminar destinos de integración')">
                <strong>destinations.delete</strong>
                <small>Eliminar destinos</small>
              </div>
            </div>
            <small class="p-hint">Haz clic en un ejemplo para usarlo como plantilla</small>
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
              [disabled]="permissionForm.invalid || saving"
              [loading]="saving"
            ></p-button>
          </div>
        </form>
      </p-card>

      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .permissions-form-page {
      padding: 1.5rem;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
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

    .examples-section {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .examples-section h4 {
      margin: 0 0 1rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: #495057;
    }

    .examples-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 0.5rem;
    }

    .example-item {
      background: #ffffff;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      padding: 0.75rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .example-item:hover {
      border-color: #007bff;
      background: #e7f3ff;
      transform: translateY(-2px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .example-item strong {
      display: block;
      color: #007bff;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      margin-bottom: 0.25rem;
    }

    .example-item small {
      color: #6c757d;
      font-size: 0.8rem;
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
export class PermissionsFormPage implements OnInit {
  private fb = inject(FormBuilder);
  private permissionsService = inject(PermissionsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  permissionForm!: FormGroup;
  isEditMode = false;
  permissionKey: string | null = null;
  saving = false;

  ngOnInit(): void {
    this.initForm();
    this.permissionKey = this.route.snapshot.paramMap.get('key');
    this.isEditMode = !!this.permissionKey && this.route.snapshot.url.some(segment => segment.path === 'edit');

    if (this.isEditMode && this.permissionKey) {
      this.loadPermission(this.permissionKey);
    }
  }

  initForm(): void {
    this.permissionForm = this.fb.group({
      key: ['', [Validators.required, Validators.pattern(/^[a-z_]+\.[a-z_]+$/)]],
      module: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  loadPermission(key: string): void {
    this.permissionsService.getPermissionByKey(key).subscribe({
      next: (permission) => {
        this.permissionForm.patchValue({
          module: permission.module,
          description: permission.description,
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el permiso',
        });
      },
    });
  }

  fillExample(key: string, module: string, description: string): void {
    this.permissionForm.patchValue({
      key,
      module,
      description,
    });
  }

  onSubmit(): void {
    if (this.permissionForm.valid) {
      this.saving = true;
      const formValue = this.permissionForm.value;

      if (this.isEditMode && this.permissionKey) {
        const updateDto: UpdatePermissionDto = {
          module: formValue.module,
          description: formValue.description,
        };

        this.permissionsService.updatePermission(this.permissionKey, updateDto).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Permiso actualizado correctamente',
            });
            this.saving = false;
            this.goBack();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al actualizar el permiso',
            });
            this.saving = false;
          },
        });
      } else {
        const createDto: CreatePermissionDto = {
          key: formValue.key,
          module: formValue.module,
          description: formValue.description,
        };

        this.permissionsService.createPermission(createDto).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Permiso creado correctamente',
            });
            this.saving = false;
            this.goBack();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al crear el permiso',
            });
            this.saving = false;
          },
        });
      }
    }
  }

  goBack(): void {
    this.router.navigate(['/permissions']);
  }
}
