import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CreateUserDto, UpdateUserDto } from '../user.model';
import { UsersService } from '../users.service';

@Component({
  selector: 'app-users-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, ButtonModule, InputTextModule, ToastModule, ToggleSwitchModule],
  providers: [MessageService],
  template: `
    <div class="users-form-page">
      <p-card>
        <ng-template pTemplate="header">
          <div class="flex justify-content-between align-items-center p-3">
            <h2>{{ isEditMode ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>
            <p-button label="Volver" icon="pi pi-arrow-left" severity="secondary" (onClick)="goBack()"></p-button>
          </div>
        </ng-template>

        <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <!-- Nombre Completo -->
            <div class="form-field">
              <label for="fullName" class="required">Nombre Completo</label>
              <input
                id="fullName"
                type="text"
                pInputText
                formControlName="fullName"
                placeholder="Ej: Juan Pérez"
                [class.ng-invalid]="userForm.get('fullName')?.invalid && userForm.get('fullName')?.touched"
              />
              <small class="p-error" *ngIf="userForm.get('fullName')?.invalid && userForm.get('fullName')?.touched"> El nombre completo es requerido </small>
            </div>

            <!-- Email -->
            <div class="form-field">
              <label for="email" class="required">Email</label>
              <input
                id="email"
                type="email"
                pInputText
                formControlName="email"
                placeholder="usuario@ejemplo.com"
                [class.ng-invalid]="userForm.get('email')?.invalid && userForm.get('email')?.touched"
              />
              <small class="p-error" *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched"> Email válido es requerido </small>
            </div>

            <!-- Password (solo en modo creación o si se desea cambiar) -->
            <div class="form-field" *ngIf="!isEditMode || showPasswordField">
              <label for="password" [class.required]="!isEditMode">Contraseña</label>
              <input
                id="password"
                type="password"
                pInputText
                formControlName="password"
                placeholder="••••••••"
                [class.ng-invalid]="userForm.get('password')?.invalid && userForm.get('password')?.touched"
              />
              <small class="p-error" *ngIf="userForm.get('password')?.invalid && userForm.get('password')?.touched"> La contraseña es requerida (mínimo 6 caracteres) </small>
            </div>

            <!-- Mostrar campo password en modo edición -->
            <div class="form-field" *ngIf="isEditMode && !showPasswordField">
              <label>&nbsp;</label>
              <p-button label="Cambiar contraseña" icon="pi pi-key" severity="secondary" (onClick)="togglePasswordField()" type="button"></p-button>
            </div>

            <!-- Avatar URL -->
            <div class="form-field">
              <label for="avatarUrl">URL del Avatar</label>
              <input id="avatarUrl" type="url" pInputText formControlName="avatarUrl" placeholder="https://ejemplo.com/avatar.jpg" />
            </div>

            <!-- Estado Activo -->
            <div class="form-field">
              <label for="isActive">Activo</label>
              <p-inputSwitch id="isActive" formControlName="isActive"></p-inputSwitch>
            </div>

            <!-- Super Admin -->
            <div class="form-field">
              <label for="isSuperAdmin">Super Admin</label>
              <p-inputSwitch id="isSuperAdmin" formControlName="isSuperAdmin"></p-inputSwitch>
            </div>
          </div>

          <div class="form-actions">
            <p-button label="Cancelar" severity="secondary" (onClick)="goBack()" type="button"></p-button>
            <p-button [label]="isEditMode ? 'Actualizar' : 'Crear'" icon="pi pi-save" type="submit" [disabled]="userForm.invalid || saving" [loading]="saving"></p-button>
          </div>
        </form>
      </p-card>

      <p-toast></p-toast>
    </div>
  `,
  styles: [
    `
      .users-form-page {
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

      .form-field input {
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
export class UsersFormPage implements OnInit {
  private fb = inject(FormBuilder);
  private usersService = inject(UsersService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);

  userForm!: FormGroup;
  isEditMode = false;
  userId: string | null = null;
  saving = false;
  showPasswordField = false;

  ngOnInit(): void {
    // Determinar modo de edición ANTES de inicializar el formulario
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.userId && this.route.snapshot.url.some((segment) => segment.path === 'edit');

    // Inicializar formulario con validaciones correctas según el modo
    this.initForm();

    if (this.isEditMode && this.userId) {
      this.loadUser(this.userId);
    }
  }

  initForm(): void {
    this.userForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      avatarUrl: [''],
      isActive: [true],
      isSuperAdmin: [false],
    });
  }

  togglePasswordField(): void {
    this.showPasswordField = !this.showPasswordField;
    if (this.showPasswordField) {
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    } else {
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.setValue('');
    }
    this.userForm.get('password')?.updateValueAndValidity();
  }

  loadUser(id: string): void {
    this.usersService.findOne(id).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          fullName: user.fullName,
          email: user.email,
          avatarUrl: user.avatarUrl,
          isActive: user.isActive,
          isSuperAdmin: user.isSuperAdmin,
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar el usuario',
        });
      },
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.saving = true;
      const formValue = this.userForm.value;

      // Limpiar campos vacíos
      const payload = Object.keys(formValue).reduce((acc, key) => {
        if (formValue[key] !== '' && formValue[key] !== null) {
          acc[key] = formValue[key];
        }
        return acc;
      }, {} as any);

      // En modo edición, no enviar password si está vacío
      if (this.isEditMode && !this.showPasswordField) {
        delete payload.password;
      }

      const operation = this.isEditMode && this.userId ? this.usersService.update(this.userId, payload as UpdateUserDto) : this.usersService.create(payload as CreateUserDto);

      operation.subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Usuario ${this.isEditMode ? 'actualizado' : 'creado'} correctamente`,
          });
          this.saving = false;
          this.goBack();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Error al ${this.isEditMode ? 'actualizar' : 'crear'} el usuario`,
          });
          this.saving = false;
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}
