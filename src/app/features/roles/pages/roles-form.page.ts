import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CreateRoleDto, UpdateRoleDto } from '../role.model';
import { RolesService } from '../roles.service';

@Component({
  selector: 'app-roles-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    ToggleSwitchModule,
    ToastModule,
  ],
  providers: [MessageService],
  template: `
    <div class="roles-form-page">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-content-between align-items-center p-3">
            <h2>{{ isEditMode ? 'Editar Rol' : 'Nuevo Rol' }}</h2>
            <p-button
              label="Volver"
              icon="pi pi-arrow-left"
              severity="secondary"
              (onClick)="goBack()"
            ></p-button>
          </div>
        </ng-template>

        <form [formGroup]="roleForm" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <!-- Nombre -->
            <div class="form-field">
              <label for="name" class="required">Nombre</label>
              <input
                id="name"
                type="text"
                pInputText
                formControlName="name"
                placeholder="Ej: Administrador"
                [class.ng-invalid]="
                  roleForm.get('name')?.invalid && roleForm.get('name')?.touched
                "
              />
              <small
                class="p-error"
                *ngIf="
                  roleForm.get('name')?.invalid && roleForm.get('name')?.touched
                "
              >
                El nombre es requerido
              </small>
            </div>

            <!-- Descripción -->
            <div class="form-field full-width">
              <label for="description">Descripción</label>
              <textarea
                id="description"
                pInputTextarea
                formControlName="description"
                placeholder="Descripción del rol"
                rows="3"
              ></textarea>
            </div>

            <!-- Estado Activo -->
            <div class="form-field">
              <label for="isActive">Activo</label>
              <p-toggleswitch
                id="isActive"
                formControlName="isActive"
              ></p-toggleswitch>
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
              [disabled]="roleForm.invalid || saving"
              [loading]="saving"
            ></p-button>
          </div>
        </form>
      </p-card>

      <p-toast></p-toast>
    </div>
  `,
  styles: [
    `
      .roles-form-page {
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
    `,
  ],
})
export class RolesFormPage implements OnInit {
  private fb = inject(FormBuilder);
  private rolesService = inject(RolesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  roleForm!: FormGroup;
  isEditMode = false;
  roleId: string | null = null;
  saving = false;

  ngOnInit(): void {
    this.initForm();
    this.roleId = this.route.snapshot.paramMap.get('id');
    this.isEditMode =
      !!this.roleId &&
      this.route.snapshot.url.some((segment) => segment.path === 'edit');

    if (this.isEditMode && this.roleId) {
      this.loadRole(this.roleId);
    }
  }

  initForm(): void {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      isActive: [true],
    });
  }

  loadRole(id: string): void {
    this.rolesService.findOne(id).subscribe({
      next: (role) => {
        if (role.isSystem) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: 'Los roles del sistema no pueden ser editados',
          });
          this.router.navigate(['/roles']);
          return;
        }

        this.roleForm.patchValue({
          name: role.name,
          description: role.description,
          isActive: role.isActive,
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el rol',
        });
      },
    });
  }

  onSubmit(): void {
    if (this.roleForm.valid) {
      this.saving = true;
      const formValue = this.roleForm.value;

      // Limpiar campos vacíos
      const payload = Object.keys(formValue).reduce((acc, key) => {
        if (formValue[key] !== '' && formValue[key] !== null) {
          acc[key] = formValue[key];
        }
        return acc;
      }, {} as any);

      const operation =
        this.isEditMode && this.roleId
          ? this.rolesService.update(this.roleId, payload as UpdateRoleDto)
          : this.rolesService.create(payload as CreateRoleDto);

      operation.subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Rol ${
              this.isEditMode ? 'actualizado' : 'creado'
            } correctamente`,
          });
          this.saving = false;
          this.goBack();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Error al ${
              this.isEditMode ? 'actualizar' : 'crear'
            } el rol`,
          });
          this.saving = false;
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/roles']);
  }
}
